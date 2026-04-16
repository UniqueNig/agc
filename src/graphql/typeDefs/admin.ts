import gql from "graphql-tag";

const adminTypeDefs = gql`
  type AdminUser {
    id: ID!
    name: String!
    email: String!
    role: String!
    isEnvironment: Boolean!
    createdAt: String
    updatedAt: String
  }

  input CreateAdminUserInput {
    name: String
    email: String!
    password: String!
    role: String!
  }

  input UpdateAdminUserInput {
    name: String
    email: String
    password: String
    role: String
  }

  extend type Query {
    currentAdmin: AdminUser
    adminUsers: [AdminUser!]!
  }

  extend type Mutation {
    createAdminUser(input: CreateAdminUserInput!): AdminUser!
    updateAdminUser(id: ID!, input: UpdateAdminUserInput!): AdminUser
    deleteAdminUser(id: ID!): Boolean!
  }
`;

export default adminTypeDefs;
