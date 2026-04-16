import { mergeResolvers } from "@graphql-tools/merge";
import adminResolver from "./adminResolver";
import contestantResolver from "./contestantResolver";
import paymentResolver from "./paymentResolver";
import stageResolver from "./stageResolver";
import voteResolver from "./voteResolver";

export const resolvers = mergeResolvers([
  adminResolver,
  contestantResolver,
  stageResolver,
  paymentResolver,
  voteResolver,
]);
