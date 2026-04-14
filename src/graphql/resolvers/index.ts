import { mergeResolvers } from "@graphql-tools/merge";
import contestantResolver from "./contestantResolver";
import paymentResolver from "./paymentResolver";
import stageResolver from "./stageResolver";
import voteResolver from "./voteResolver";

export const resolvers = mergeResolvers([
  contestantResolver,
  stageResolver,
  paymentResolver,
  voteResolver,
]);
