import { GraphQLError } from "graphql";
import { Types, isValidObjectId } from "mongoose";
import type {
  ContestantStatus,
} from "@/src/models/Contestant";
import type { PaymentStatus } from "@/src/models/Payment";
import type { VoteStatus } from "@/src/models/Vote";
import type { getAdminSession } from "@/src/lib/admin-auth";

const contestantStatuses = new Set<ContestantStatus>([
  "active",
  "pending",
  "eliminated",
]);
const paymentStatuses = new Set<PaymentStatus>(["pending", "success", "failed"]);
const voteStatuses = new Set<VoteStatus>(["pending", "success", "failed"]);

export type GraphQLContext = {
  adminSession: Awaited<ReturnType<typeof getAdminSession>>;
};

export const toObjectId = (value: string, fieldName = "id") => {
  if (!isValidObjectId(value)) {
    throw new GraphQLError(`Invalid ${fieldName}.`);
  }

  return new Types.ObjectId(value);
};

export const normalizeContestantStatus = (status?: string | null) => {
  if (!status) return undefined;

  const normalized = status.toLowerCase() as ContestantStatus;
  if (!contestantStatuses.has(normalized)) {
    throw new GraphQLError("Invalid contestant status.");
  }

  return normalized;
};

export const normalizePaymentStatus = (status?: string | null) => {
  if (!status) return undefined;

  const normalized = status.toLowerCase() as PaymentStatus;
  if (!paymentStatuses.has(normalized)) {
    throw new GraphQLError("Invalid payment status.");
  }

  return normalized;
};

export const normalizeVoteStatus = (status?: string | null) => {
  if (!status) return undefined;

  const normalized = status.toLowerCase() as VoteStatus;
  if (!voteStatuses.has(normalized)) {
    throw new GraphQLError("Invalid vote status.");
  }

  return normalized;
};

export const serializeDate = (value: Date | string | null | undefined) => {
  if (!value) return null;
  return new Date(value).toISOString();
};

export const requireAdmin = (context: GraphQLContext) => {
  if (!context.adminSession) {
    throw new GraphQLError("Unauthorized.", {
      extensions: {
        code: "UNAUTHORIZED",
      },
    });
  }

  return context.adminSession;
};
