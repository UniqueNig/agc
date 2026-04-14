import { NextRequest, NextResponse } from "next/server";
import contestantModel from "@/src/models/Contestant";
import paymentModel from "@/src/models/Payment";
import voteModel from "@/src/models/Vote";
import { connectDB } from "@/src/lib/db";

type PaystackWebhookPayload = {
  event?: string;
  data?: {
    reference?: string;
  };
};

export async function POST(req: NextRequest) {
  await connectDB();

  const body = (await req.json()) as PaystackWebhookPayload;

  if (body.event === "charge.success" && body.data?.reference) {
    const reference = body.data.reference;
    const payment = await paymentModel.findOne({ reference });

    if (payment && payment.status !== "success") {
      payment.status = "success";
      payment.verifiedAt = new Date();
      await payment.save();

      await Promise.all([
        contestantModel.findByIdAndUpdate(payment.contestantId, {
          $inc: { totalVotes: payment.votes },
        }),
        voteModel.updateMany(
          { reference, status: { $ne: "success" } },
          {
            status: "success",
            paymentId: payment._id,
          }
        ),
      ]);
    }
  }

  return NextResponse.json({ received: true });
}
