import bcrypt from "bcryptjs";
import { GraphQLError } from "graphql";
import adminUserModel from "@/src/models/AdminUser";
import { createAdminAccount } from "@/src/lib/admin-auth";
import type { AdminRole } from "@/src/lib/admin-permissions";
import {
  normalizeAdminRole,
  requireAdmin,
  requireAdminPermission,
  serializeDate,
  toObjectId,
  type GraphQLContext,
} from "./utils";

type CreateAdminUserArgs = {
  input: {
    name?: string | null;
    email: string;
    password: string;
    role: string;
  };
};

type UpdateAdminUserArgs = {
  id: string;
  input: {
    name?: string | null;
    email?: string | null;
    password?: string | null;
    role?: string | null;
  };
};

type DeleteAdminUserArgs = {
  id: string;
};

const countSuperAdmins = () =>
  adminUserModel.countDocuments({ role: "super_admin" });

const ensureSuperAdminWillRemain = async (
  currentRole: AdminRole,
  nextRole?: AdminRole
) => {
  if (currentRole !== "super_admin") {
    return;
  }

  if (!nextRole || nextRole === "super_admin") {
    return;
  }

  if ((await countSuperAdmins()) <= 1) {
    throw new GraphQLError("You must keep at least one super admin.");
  }
};

const adminResolver = {
  Query: {
    currentAdmin: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => requireAdmin(context),

    adminUsers: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const session = requireAdmin(context);

      if (session.role !== "super_admin") {
        return [];
      }

      return adminUserModel.find().sort({ createdAt: 1 });
    },
  },

  Mutation: {
    createAdminUser: async (
      _: unknown,
      { input }: CreateAdminUserArgs,
      context: GraphQLContext
    ) => {
      requireAdminPermission(context, "manage_admins");

      const role = normalizeAdminRole(input.role) ?? "viewer";

      return createAdminAccount({
        name: input.name ?? "",
        email: input.email,
        password: input.password,
        role,
      });
    },

    updateAdminUser: async (
      _: unknown,
      { id, input }: UpdateAdminUserArgs,
      context: GraphQLContext
    ) => {
      const session = requireAdminPermission(context, "manage_admins");
      const adminId = toObjectId(id);
      const existingAdmin = await adminUserModel.findById(adminId);

      if (!existingAdmin) {
        throw new GraphQLError("Admin user not found.");
      }

      const updateData: Record<string, unknown> = {};

      if (typeof input.name === "string") {
        updateData.name = input.name.trim();
      }

      if (typeof input.email === "string") {
        const email = input.email.trim().toLowerCase();

        if (!email) {
          throw new GraphQLError("Email is required.");
        }

        const emailOwner = await adminUserModel.findOne({
          email,
          _id: { $ne: adminId },
        });

        if (emailOwner) {
          throw new GraphQLError("An admin with this email already exists.");
        }

        updateData.email = email;
      }

      if (typeof input.password === "string" && input.password.trim()) {
        if (input.password.trim().length < 8) {
          throw new GraphQLError(
            "Password must be at least 8 characters long."
          );
        }

        updateData.passwordHash = await bcrypt.hash(input.password.trim(), 12);
      }

      const normalizedRole = normalizeAdminRole(input.role);
      const existingRole = normalizeAdminRole(existingAdmin.role) ?? "viewer";
      if (normalizedRole) {
        await ensureSuperAdminWillRemain(existingRole, normalizedRole);
        updateData.role = normalizedRole;
      }

      if (
        session.source === "database" &&
        session.id === existingAdmin._id.toString() &&
        normalizedRole &&
        normalizedRole !== "super_admin"
      ) {
        await ensureSuperAdminWillRemain(existingRole, normalizedRole);
      }

      return adminUserModel.findByIdAndUpdate(adminId, updateData, {
        new: true,
        runValidators: true,
      });
    },

    deleteAdminUser: async (
      _: unknown,
      { id }: DeleteAdminUserArgs,
      context: GraphQLContext
    ) => {
      const session = requireAdminPermission(context, "manage_admins");
      const adminId = toObjectId(id);
      const existingAdmin = await adminUserModel.findById(adminId);

      if (!existingAdmin) {
        return false;
      }

      if (
        session.source === "database" &&
        session.id === existingAdmin._id.toString()
      ) {
        throw new GraphQLError("You cannot delete your own admin account.");
      }

      await ensureSuperAdminWillRemain(
        normalizeAdminRole(existingAdmin.role) ?? "viewer",
        "viewer"
      );

      await adminUserModel.findByIdAndDelete(adminId);
      return true;
    },
  },

  AdminUser: {
    id: (parent: { id?: string; _id?: { toString(): string } }) =>
      parent.id ?? parent._id?.toString() ?? "",
    isEnvironment: (parent: { source?: string }) =>
      parent.source === "environment",
    createdAt: (parent: { createdAt?: Date | string | null }) =>
      serializeDate(parent.createdAt),
    updatedAt: (parent: { updatedAt?: Date | string | null }) =>
      serializeDate(parent.updatedAt),
  },
};

export default adminResolver;
