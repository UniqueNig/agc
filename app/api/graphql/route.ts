// import { resolvers } from '@/src/graphql/resolvers'
// import { typeDefs } from '@/src/graphql/typeDefs'
import { NextRequest } from "next/server";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { resolvers, typeDefs } from "@/src/graphql";
import { connectDB } from "@/src/lib/db";


const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => {
    await connectDB();
    return { req };
  },
});

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
