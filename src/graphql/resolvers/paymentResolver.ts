import { GraphQLError } from "graphql";
import paymentModel from "@/src/models/Payment";
import contestantModel from "@/src/models/Contestant";
import {
  normalizePaymentStatus,
  requireAdmin,
  serializeDate,
  toObjectId,
  type GraphQLContext,
} from "./utils";

type PaymentsArgs = {
  status?: string | null;
  contestantId?: string | null;
};

type PaymentArgs = {
  id?: string | null;
  reference?: string | null;
};

const paymentResolver = {
  Query: {
    payments: async (
      _: unknown,
      { status, contestantId }: PaymentsArgs,
      context: GraphQLContext
    ) => {
      requireAdmin(context);
      const filter: Record<string, unknown> = {};
      const normalizedStatus = normalizePaymentStatus(status);

      if (normalizedStatus) {
        filter.status = normalizedStatus;
      }

      if (contestantId) {
        filter.contestantId = toObjectId(contestantId, "contestantId");
      }

      return paymentModel.find(filter).sort({ createdAt: -1 });
    },

    payment: async (
      _: unknown,
      { id, reference }: PaymentArgs,
      context: GraphQLContext
    ) => {
      requireAdmin(context);
      if (!id && !reference) {
        throw new GraphQLError("Provide either a payment id or reference.");
      }

      if (id) {
        return paymentModel.findById(toObjectId(id));
      }

      return paymentModel.findOne({ reference });
    },
  },

  Payment: {
    contestant: async (parent: { contestantId: string }) =>
      contestantModel.findById(parent.contestantId),
    verifiedAt: (parent: { verifiedAt?: Date | string | null }) =>
      serializeDate(parent.verifiedAt),
    createdAt: (parent: { createdAt: Date | string }) =>
      serializeDate(parent.createdAt),
    updatedAt: (parent: { updatedAt: Date | string }) =>
      serializeDate(parent.updatedAt),
  },
};

export default paymentResolver;
