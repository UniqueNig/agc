import { Model, Schema, model, models } from "mongoose";

export interface StageDocument {
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const stageSchema = new Schema<StageDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const stageModel =
  (models.Stage as Model<StageDocument>) ||
  model<StageDocument>("Stage", stageSchema);

export default stageModel;
