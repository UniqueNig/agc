import { GraphQLError } from "graphql";
import { initializePayment } from "@/src/lib/paystack";
import contestantModel from "@/src/models/Contestant";
import paymentModel from "@/src/models/Payment";
import voteModel from "@/src/models/Vote";
import {
  normalizeVoteStatus,
  requireAdmin,
  serializeDate,
  toObjectId,
  type GraphQLContext,
} from "./utils";

type VotesArgs = {
  contestantId?: string | null;
  status?: string | null;
};

type VoteArgs = {
  id: string;
};

type CreateVotePaymentArgs = {
  input: {
    contestantId: string;
    votes: number;
    email: string;
  };
};

const voteResolver = {
  Query: {
    votes: async (
      _: unknown,
      { contestantId, status }: VotesArgs,
      context: GraphQLContext
    ) => {
      requireAdmin(context);
      const filter: Record<string, unknown> = {};
      const normalizedStatus = normalizeVoteStatus(status);

      if (contestantId) {
        filter.contestantId = toObjectId(contestantId, "contestantId");
      }

      if (normalizedStatus) {
        filter.status = normalizedStatus;
      }

      return voteModel.find(filter).sort({ createdAt: -1 });
    },

    vote: async (_: unknown, { id }: VoteArgs, context: GraphQLContext) => {
      requireAdmin(context);
      return voteModel.findById(toObjectId(id));
    },
  },

  Mutation: {
    createVotePayment: async (_: unknown, { input }: CreateVotePaymentArgs) => {
      const contestantId = toObjectId(input.contestantId, "contestantId");
      const contestant = await contestantModel.findById(contestantId);

      if (!contestant) {
        throw new GraphQLError("Contestant not found.");
      }

      if (!Number.isInteger(input.votes) || input.votes < 1) {
        throw new GraphQLError("Votes must be a positive whole number.");
      }

      const email = input.email.trim().toLowerCase();
      if (!email) {
        throw new GraphQLError("Email is required.");
      }

      const amount = input.votes * 100;
      const paymentResponse = await initializePayment(email, amount);

      const payment = await paymentModel.create({
        reference: paymentResponse.data.reference,
        email,
        amount,
        votes: input.votes,
        contestantId,
        authorizationUrl: paymentResponse.data.authorization_url,
        accessCode: paymentResponse.data.access_code,
        status: "pending",
      });

      await voteModel.create({
        contestantId,
        paymentId: payment._id,
        reference: payment.reference,
        email,
        votes: input.votes,
        amount,
        status: "pending",
      });

      return payment;
    },
  },

  Vote: {
    contestant: async (parent: { contestantId: string }) =>
      contestantModel.findById(parent.contestantId),

    payment: async (parent: { paymentId?: string | null }) => {
      if (!parent.paymentId) return null;
      return paymentModel.findById(parent.paymentId);
    },
    createdAt: (parent: { createdAt: Date | string }) =>
      serializeDate(parent.createdAt),
    updatedAt: (parent: { updatedAt: Date | string }) =>
      serializeDate(parent.updatedAt),
  },
};

export default voteResolver;
