import { Model, Schema, Types, model, models } from "mongoose";

export type ContestantStatus = "active" | "pending" | "eliminated";

export interface ContestantDocument {
  name: string;
  image: string;
  contestantNumber: string;
  totalVotes: number;
  stageId: Types.ObjectId | null;
  status: ContestantStatus;
  createdAt: Date;
  updatedAt: Date;
}

const contestantSchema = new Schema<ContestantDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    contestantNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    totalVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    stageId: {
      type: Schema.Types.ObjectId,
      ref: "Stage",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "pending", "eliminated"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const contestantModel =
  (models.Contestant as Model<ContestantDocument>) ||
  model<ContestantDocument>("Contestant", contestantSchema);

export default contestantModel;
