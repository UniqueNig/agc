import { Model, Schema, Types, model, models } from "mongoose";

export type VoteStatus = "pending" | "success" | "failed";

export interface VoteDocument {
  contestantId: Types.ObjectId;
  paymentId: Types.ObjectId | null;
  reference: string;
  email: string;
  votes: number;
  amount: number;
  status: VoteStatus;
  createdAt: Date;
  updatedAt: Date;
}

const voteSchema = new Schema<VoteDocument>(
  {
    contestantId: {
      type: Schema.Types.ObjectId,
      ref: "Contestant",
      required: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    reference: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    votes: {
      type: Number,
      required: true,
      min: 1,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const voteModel =
  (models.Vote as Model<VoteDocument>) ||
  model<VoteDocument>("Vote", voteSchema);

export default voteModel;
