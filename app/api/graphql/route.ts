// import { resolvers } from '@/src/graphql/resolvers'
// import { typeDefs } from '@/src/graphql/typeDefs'
import { NextRequest } from "next/server";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { resolvers, typeDefs } from "@/src/graphql";
import { connectDB } from "@/src/lib/db";
import type { GraphQLContext } from "@/src/graphql/resolvers/utils";
import {
  ADMIN_AUTH_COOKIE,
  getAdminSessionFromToken,
} from "@/src/lib/admin-auth";


const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(server, {
  context: async (req) => {
    const token = req.cookies.get(ADMIN_AUTH_COOKIE)?.value;

    return {
      req,
      adminSession: token ? await getAdminSessionFromToken(token) : null,
    };
  },
});

async function handleGraphQLRequest(request: NextRequest) {
  try {
    await connectDB();
    return handler(request);
  } catch (error) {
    return Response.json(
      {
        errors: [
          {
            message:
              error instanceof Error
                ? error.message
                : "Unable to connect to the database.",
          },
        ],
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleGraphQLRequest(request);
}

export async function POST(request: NextRequest) {
  return handleGraphQLRequest(request);
}
