import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import { markPaymentSuccessful } from "@/src/lib/payments";

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
    await markPaymentSuccessful(body.data.reference);
  }

  return NextResponse.json({ received: true });
}
