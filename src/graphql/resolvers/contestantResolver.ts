import { GraphQLError } from "graphql";
import contestantModel, {
  type ContestantDocument,
} from "@/src/models/Contestant";
import stageModel from "@/src/models/Stage";
import paymentModel from "@/src/models/Payment";
import voteModel from "@/src/models/Vote";
import {
  normalizeContestantStatus,
  requireAdminPermission,
  serializeDate,
  toObjectId,
  type GraphQLContext,
} from "./utils";

type ContestantsArgs = {
  stageId?: string | null;
  status?: string | null;
};

type ContestantArgs = {
  id: string;
};

type LeaderboardArgs = {
  stageId?: string | null;
  limit?: number | null;
};

type CreateContestantArgs = {
  input: {
    name: string;
    image?: string | null;
    contestantNumber: string;
    stageId?: string | null;
    status?: string | null;
  };
};

type UpdateContestantArgs = {
  id: string;
  input: {
    name?: string | null;
    image?: string | null;
    contestantNumber?: string | null;
    stageId?: string | null;
    status?: string | null;
    totalVotes?: number | null;
  };
};

const buildContestantFilter = ({ stageId, status }: ContestantsArgs) => {
  const filter: Record<string, unknown> = {};
  const normalizedStatus = normalizeContestantStatus(status);

  if (stageId) {
    filter.stageId = toObjectId(stageId, "stageId");
  }

  if (normalizedStatus) {
    filter.status = normalizedStatus;
  }

  return filter;
};

const contestantResolver = {
  Query: {
    contestants: async (_: unknown, args: ContestantsArgs) =>
      contestantModel.find(buildContestantFilter(args)).sort({
        contestantNumber: 1,
      }),

    contestant: async (_: unknown, { id }: ContestantArgs) =>
      contestantModel.findById(toObjectId(id)),

    leaderboard: async (_: unknown, { stageId, limit }: LeaderboardArgs) => {
      const safeLimit = limit && limit > 0 ? limit : 10;

      return contestantModel
        .find(buildContestantFilter({ stageId }))
        .sort({ totalVotes: -1, contestantNumber: 1 })
        .limit(safeLimit);
    },
  },

  Mutation: {
    createContestant: async (
      _: unknown,
      { input }: CreateContestantArgs,
      context: GraphQLContext
    ) => {
      requireAdminPermission(context, "manage_contestants");
      const normalizedStatus = normalizeContestantStatus(input.status) ?? "pending";
      const existingContestant = await contestantModel.findOne({
        contestantNumber: input.contestantNumber,
      });

      if (existingContestant) {
        throw new GraphQLError("Contestant number already exists.");
      }

      if (input.stageId) {
        const stageExists = await stageModel.exists({
          _id: toObjectId(input.stageId, "stageId"),
        });

        if (!stageExists) {
          throw new GraphQLError("Stage not found.");
        }
      }

      return contestantModel.create({
        name: input.name,
        image: input.image ?? "",
        contestantNumber: input.contestantNumber,
        stageId: input.stageId ? toObjectId(input.stageId, "stageId") : null,
        status: normalizedStatus,
      });
    },

    updateContestant: async (
      _: unknown,
      { id, input }: UpdateContestantArgs,
      context: GraphQLContext
    ) => {
      requireAdminPermission(context, "manage_contestants");
      const updateData: Partial<ContestantDocument> = {};

      if (typeof input.name === "string") updateData.name = input.name;
      if (typeof input.image === "string") updateData.image = input.image;
      if (typeof input.contestantNumber === "string") {
        const existingContestant = await contestantModel.findOne({
          contestantNumber: input.contestantNumber,
          _id: { $ne: toObjectId(id) },
        });

        if (existingContestant) {
          throw new GraphQLError("Contestant number already exists.");
        }

        updateData.contestantNumber = input.contestantNumber;
      }
      if (typeof input.totalVotes === "number") {
        updateData.totalVotes = Math.max(0, input.totalVotes);
      }

      const normalizedStatus = normalizeContestantStatus(input.status);
      if (normalizedStatus) updateData.status = normalizedStatus;

      if (input.stageId !== undefined) {
        if (input.stageId === null) {
          updateData.stageId = null;
        } else {
          const stageId = toObjectId(input.stageId, "stageId");
          const stageExists = await stageModel.exists({ _id: stageId });
          if (!stageExists) {
            throw new GraphQLError("Stage not found.");
          }
          updateData.stageId = stageId;
        }
      }

      return contestantModel.findByIdAndUpdate(toObjectId(id), updateData, {
        new: true,
        runValidators: true,
      });
    },

    deleteContestant: async (
      _: unknown,
      { id }: ContestantArgs,
      context: GraphQLContext
    ) => {
      requireAdminPermission(context, "manage_contestants");
      const contestantId = toObjectId(id);
      const deleted = await contestantModel.findByIdAndDelete(contestantId);

      if (!deleted) {
        return false;
      }

      await Promise.all([
        paymentModel.deleteMany({ contestantId }),
        voteModel.deleteMany({ contestantId }),
      ]);

      return true;
    },
  },

  Contestant: {
    stage: async (parent: { stageId?: string | null }) => {
      if (!parent.stageId) return null;
      return stageModel.findById(parent.stageId);
    },
    createdAt: (parent: { createdAt: Date | string }) =>
      serializeDate(parent.createdAt),
    updatedAt: (parent: { updatedAt: Date | string }) =>
      serializeDate(parent.updatedAt),
  },
};

export default contestantResolver;
