type GraphQLResponse<TData> = {
  data?: TData;
  errors?: Array<{
    message: string;
  }>;
};

export async function graphqlRequest<TData, TVariables = Record<string, never>>(
  query: string,
  variables?: TVariables
) {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    cache: "no-store",
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const payload = (await response.json()) as GraphQLResponse<TData>;

  if (!response.ok || payload.errors?.length) {
    const message =
      payload.errors?.map((error) => error.message).join("\n") ||
      "Something went wrong while talking to the server.";
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error("The server returned an empty response.");
  }

  return payload.data;
}
