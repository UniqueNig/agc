import { mergeTypeDefs } from "@graphql-tools/merge";
import baseTypeDefs from "./base";
import contestantTypeDefs from "./contestant";
import paymentTypeDefs from "./payment";
import stageTypeDefs from "./stage";
import voteTypeDefs from "./vote";

export const typeDefs = mergeTypeDefs([
  baseTypeDefs,
  contestantTypeDefs,
  stageTypeDefs,
  paymentTypeDefs,
  voteTypeDefs,
]);
