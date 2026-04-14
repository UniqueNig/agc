import gql from "graphql-tag";

const paymentTypeDefs = gql`
  type Payment {
    id: ID!
    reference: String!
    email: String!
    amount: Int!
    votes: Int!
    contestantId: ID!
    authorizationUrl: String!
    accessCode: String!
    status: String!
    verifiedAt: String
    contestant: Contestant
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    payments(status: String, contestantId: ID): [Payment!]!
    payment(id: ID, reference: String): Payment
  }
`;

export default paymentTypeDefs;
