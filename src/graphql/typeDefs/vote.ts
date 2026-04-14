import gql from "graphql-tag";

const voteTypeDefs = gql`
  type Vote {
    id: ID!
    contestantId: ID!
    paymentId: ID
    reference: String!
    email: String!
    votes: Int!
    amount: Int!
    status: String!
    contestant: Contestant
    payment: Payment
    createdAt: String!
    updatedAt: String!
  }

  input CreateVotePaymentInput {
    contestantId: ID!
    votes: Int!
    email: String!
  }

  extend type Query {
    votes(contestantId: ID, status: String): [Vote!]!
    vote(id: ID!): Vote
  }

  extend type Mutation {
    createVotePayment(input: CreateVotePaymentInput!): Payment!
  }
`;

export default voteTypeDefs;
