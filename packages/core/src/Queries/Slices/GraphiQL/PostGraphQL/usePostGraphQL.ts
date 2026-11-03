import { useMemo } from "react";
import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { ExecutionResult } from "graphql";
import {
  parseJsonResponse,
  useFetchHelpers,
} from "@inmanta/web-console-core/Queries/Helpers/useFetchHelpers";
import { PrimaryBaseUrlManager } from "@inmanta/web-console-core/Routing";

/**
 * A GraphQL request as the GraphiQL editor sends it. It matches `FetcherParams` from
 * `@graphiql/toolkit`, which only the GraphiQL feature depends on.
 */
export interface GraphQLRequest {
  query: string;
  operationName?: string | null;
  variables?: unknown;
}

/**
 * React Query mutation hook for executing GraphQL requests against /api/v2/graphql.
 *
 * Used as the fetcher for the GraphiQL editor. Sends JSON with Content-Type: application/json.
 * Variables are parsed from string if needed, as GraphiQL passes them as raw editor text.
 *
 * @param {string} [env] - Optional environment Id to include as X-Inmanta-Tid header.
 * @returns {UseMutationResult} The mutation object whose `mutateAsync` serves as the GraphiQL Fetcher.
 */
export const usePostGraphQL = (
  env?: string
): UseMutationResult<ExecutionResult, Error, GraphQLRequest> => {
  const { createHeaders, handleErrors } = useFetchHelpers();

  const baseUrl = useMemo(
    () =>
      new PrimaryBaseUrlManager(
        globalThis.location.origin,
        globalThis.location.pathname
      ).getBaseUrl(),
    []
  );

  return useMutation({
    mutationKey: ["post_graphql", env],
    mutationFn: async ({ query, variables }: GraphQLRequest) => {
      const headers = createHeaders({ env });
      headers.set("Content-Type", "application/json");

      // GraphiQL passes variables as a raw JSON string from the editor.
      // graphql-core expects a dict, not a string — parse it here.
      const parsedVariables =
        typeof variables === "string"
          ? variables.trim()
            ? JSON.parse(variables)
            : undefined
          : variables;

      const response = await fetch(`${baseUrl}/api/v2/graphql`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables: parsedVariables }),
      });

      await handleErrors(response, { method: "POST", path: "/api/v2/graphql" });

      return (await parseJsonResponse<ExecutionResult>(response)) ?? {};
    },
  });
};
