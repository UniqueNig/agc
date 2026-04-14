import gql from "graphql-tag";

const stageTypeDefs = gql`
  type Stage {
    id: ID!
    name: String!
    isActive: Boolean!
    contestants: [Contestant!]!
    contestantCount: Int!
    totalVotes: Int!
    createdAt: String!
    updatedAt: String!
  }

  input CreateStageInput {
    name: String!
    isActive: Boolean
  }

  input UpdateStageInput {
    name: String
    isActive: Boolean
  }

  extend type Query {
    stages: [Stage!]!
    stage(id: ID!): Stage
    activeStage: Stage
  }

  extend type Mutation {
    createStage(input: CreateStageInput!): Stage!
    updateStage(id: ID!, input: UpdateStageInput!): Stage
    deleteStage(id: ID!): Boolean!
    activateStage(id: ID!): Stage
  }
`;

export default stageTypeDefs;
