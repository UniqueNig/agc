import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import { markPaymentFailed, markPaymentSuccessful } from "@/src/lib/payments";
import { verifyPayment } from "@/src/lib/paystack";

type VerifyPaymentRequestBody = {
  reference?: string;
};

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = (await request.json()) as VerifyPaymentRequestBody;
    const reference = body.reference?.trim();

    if (!reference) {
      return NextResponse.json(
        { message: "Payment reference is required." },
        { status: 400 }
      );
    }

    const verification = await verifyPayment(reference);

    if (verification.data.status === "success") {
      const payment = await markPaymentSuccessful(reference);

      return NextResponse.json({
        success: true,
        payment: {
          id: String(payment._id),
          reference: payment.reference,
          status: payment.status,
          verifiedAt: payment.verifiedAt,
        },
      });
    }

    if (["failed", "abandoned", "reversed"].includes(verification.data.status)) {
      const payment = await markPaymentFailed(reference);

      return NextResponse.json(
        {
          success: false,
          payment: {
            id: String(payment._id),
            reference: payment.reference,
            status: payment.status,
          },
          message: `Payment is ${verification.data.status}.`,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: `Payment is still ${verification.data.status}.`,
      },
      { status: 409 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to verify payment right now.",
      },
      { status: 500 }
    );
  }
}
