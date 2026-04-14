import gql from "graphql-tag";

const contestantTypeDefs = gql`
  type Contestant {
    id: ID!
    name: String!
    image: String
    contestantNumber: String!
    totalVotes: Int!
    stageId: ID
    status: String!
    stage: Stage
    createdAt: String!
    updatedAt: String!
  }

  input CreateContestantInput {
    name: String!
    image: String
    contestantNumber: String!
    stageId: ID
    status: String
  }

  input UpdateContestantInput {
    name: String
    image: String
    contestantNumber: String
    stageId: ID
    status: String
    totalVotes: Int
  }

  extend type Query {
    contestants(stageId: ID, status: String): [Contestant!]!
    contestant(id: ID!): Contestant
    leaderboard(stageId: ID, limit: Int): [Contestant!]!
  }

  extend type Mutation {
    createContestant(input: CreateContestantInput!): Contestant!
    updateContestant(id: ID!, input: UpdateContestantInput!): Contestant
    deleteContestant(id: ID!): Boolean!
  }
`;

export default contestantTypeDefs;
