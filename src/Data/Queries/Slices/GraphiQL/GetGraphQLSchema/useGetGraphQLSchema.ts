import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { GraphQLSchema, buildClientSchema, IntrospectionQuery } from "graphql";
import { CustomError, useGetWithOptionalEnv } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";

interface SchemaResponse {
  data: IntrospectionQuery;
}

export const graphQLSchemaKey = new KeyFactory(SliceKeys.graphiql, "get_graphql_schema");

/**
 * React Query hook for fetching the GraphQL schema from /api/v2/graphql/schema.
 *
 * @param {string} [env] - Optional environment Id to include as X-Inmanta-Tid header.
 * @returns {UseQueryResult<GraphQLSchema>} The query result containing the built GraphQLSchema.
 */
export const useGetGraphQLSchema = (env?: string): UseQueryResult<GraphQLSchema, CustomError> => {
  const get = useGetWithOptionalEnv(env)<SchemaResponse>;

  return useQuery({
    queryKey: graphQLSchemaKey.single("schema", [env ?? ""]),
    queryFn: () => get("/api/v2/graphql/schema"),
    select: (data) => buildClientSchema(data.data),
  });
};
