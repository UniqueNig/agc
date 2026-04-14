import { Model, Schema, Types, model, models } from "mongoose";

export type PaymentStatus = "pending" | "success" | "failed";

export interface PaymentDocument {
  reference: string;
  email: string;
  amount: number;
  votes: number;
  contestantId: Types.ObjectId;
  authorizationUrl: string;
  accessCode: string;
  status: PaymentStatus;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<PaymentDocument>(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    votes: {
      type: Number,
      required: true,
      min: 1,
    },
    contestantId: {
      type: Schema.Types.ObjectId,
      ref: "Contestant",
      required: true,
    },
    authorizationUrl: {
      type: String,
      default: "",
      trim: true,
    },
    accessCode: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const paymentModel =
  (models.Payment as Model<PaymentDocument>) ||
  model<PaymentDocument>("Payment", paymentSchema);

export default paymentModel;
