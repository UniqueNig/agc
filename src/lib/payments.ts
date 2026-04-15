import contestantModel from "@/src/models/Contestant";
import paymentModel from "@/src/models/Payment";
import voteModel from "@/src/models/Vote";

export async function markPaymentSuccessful(reference: string) {
  const payment = await paymentModel.findOne({ reference });

  if (!payment) {
    throw new Error("Payment not found.");
  }

  if (payment.status !== "success") {
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

  return payment;
}

export async function markPaymentFailed(reference: string) {
  const payment = await paymentModel.findOne({ reference });

  if (!payment) {
    throw new Error("Payment not found.");
  }

  if (payment.status === "pending") {
    payment.status = "failed";
    await payment.save();

    await voteModel.updateMany(
      { reference, status: "pending" },
      {
        status: "failed",
        paymentId: payment._id,
      }
    );
  }

  return payment;
}
