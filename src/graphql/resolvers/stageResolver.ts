import { GraphQLError } from "graphql";
import stageModel, { type StageDocument } from "@/src/models/Stage";
import contestantModel from "@/src/models/Contestant";
import { serializeDate, toObjectId } from "./utils";

type StageArgs = {
  id: string;
};

type CreateStageArgs = {
  input: {
    name: string;
    isActive?: boolean | null;
  };
};

type UpdateStageArgs = {
  id: string;
  input: {
    name?: string | null;
    isActive?: boolean | null;
  };
};

const stageResolver = {
  Query: {
    stages: async () => stageModel.find().sort({ isActive: -1, createdAt: 1 }),

    stage: async (_: unknown, { id }: StageArgs) =>
      stageModel.findById(toObjectId(id)),

    activeStage: async () => stageModel.findOne({ isActive: true }),
  },

  Mutation: {
    createStage: async (_: unknown, { input }: CreateStageArgs) => {
      if (input.isActive) {
        await stageModel.updateMany({}, { isActive: false });
      }

      return stageModel.create({
        name: input.name,
        isActive: input.isActive ?? false,
      });
    },

    updateStage: async (_: unknown, { id, input }: UpdateStageArgs) => {
      const updateData: Partial<StageDocument> = {};

      if (typeof input.name === "string") updateData.name = input.name;
      if (typeof input.isActive === "boolean") {
        updateData.isActive = input.isActive;

        if (input.isActive) {
          await stageModel.updateMany(
            { _id: { $ne: toObjectId(id) } },
            { isActive: false }
          );
        }
      }

      return stageModel.findByIdAndUpdate(toObjectId(id), updateData, {
        new: true,
        runValidators: true,
      });
    },

    deleteStage: async (_: unknown, { id }: StageArgs) => {
      const stageId = toObjectId(id);
      const deleted = await stageModel.findByIdAndDelete(stageId);

      if (!deleted) {
        return false;
      }

      await contestantModel.updateMany({ stageId }, { stageId: null });
      return true;
    },

    activateStage: async (_: unknown, { id }: StageArgs) => {
      const stageId = toObjectId(id);
      const existingStage = await stageModel.findById(stageId);

      if (!existingStage) {
        throw new GraphQLError("Stage not found.");
      }

      await stageModel.updateMany({}, { isActive: false });
      return stageModel.findByIdAndUpdate(
        stageId,
        { isActive: true },
        { new: true }
      );
    },
  },

  Stage: {
    contestants: async (parent: { id: string }) =>
      contestantModel.find({ stageId: toObjectId(parent.id) }).sort({
        contestantNumber: 1,
      }),

    contestantCount: async (parent: { id: string }) =>
      contestantModel.countDocuments({ stageId: toObjectId(parent.id) }),

    totalVotes: async (parent: { id: string }) => {
      const result = await contestantModel.aggregate<{ total: number }>([
        { $match: { stageId: toObjectId(parent.id) } },
        { $group: { _id: null, total: { $sum: "$totalVotes" } } },
      ]);

      return result[0]?.total ?? 0;
    },
    createdAt: (parent: { createdAt: Date | string }) =>
      serializeDate(parent.createdAt),
    updatedAt: (parent: { updatedAt: Date | string }) =>
      serializeDate(parent.updatedAt),
  },
};

export default stageResolver;
