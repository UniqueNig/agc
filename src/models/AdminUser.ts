import mongoose, { InferSchemaType, Model } from "mongoose";
import { ADMIN_ROLES } from "@/src/lib/admin-permissions";

const adminUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ADMIN_ROLES,
      default: "viewer",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export type AdminUserDocument = InferSchemaType<typeof adminUserSchema> & {
  _id: mongoose.Types.ObjectId;
};

const adminUserModel =
  (mongoose.models.AdminUser as Model<AdminUserDocument>) ||
  mongoose.model<AdminUserDocument>("AdminUser", adminUserSchema);

export default adminUserModel;
