import { useMemo } from "react";
import { FetcherParams } from "@graphiql/toolkit";
import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { useFetchHelpers } from "@/Data/Queries/Helpers/useFetchHelpers";
import { PrimaryBaseUrlManager } from "@/UI";

/**
 * React Query mutation hook for executing GraphQL requests against /api/v2/graphql.
 *
 * Used as the fetcher for the GraphiQL editor. Sends JSON with Content-Type: application/json.
 * Variables are parsed from string if needed, as GraphiQL passes them as raw editor text.
 *
 * @param {string} [env] - Optional environment Id to include as X-Inmanta-Tid header.
 * @returns {UseMutationResult} The mutation object whose `mutateAsync` serves as the GraphiQL Fetcher.
 */
export const usePostGraphQL = (env?: string): UseMutationResult<unknown, Error, FetcherParams> => {
  const { createHeaders, handleErrors } = useFetchHelpers();

  // origin and pathname are stable for the lifetime of an SPA session, and
  // VITE_API_BASEURL is a build-time constant — memoize to avoid re-creating
  // a PrimaryBaseUrlManager instance on every render.
  const baseUrl = useMemo(
    () =>
      new PrimaryBaseUrlManager(
        globalThis.location.origin,
        globalThis.location.pathname
      ).getBaseUrl(import.meta.env.VITE_API_BASEURL),
    []
  );

  return useMutation({
    mutationKey: ["post_graphql", env],
    mutationFn: async ({ query, variables }: FetcherParams) => {
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

      await handleErrors(response);

      const text = await response.text();
      return text.trim() ? JSON.parse(text) : {};
    },
  });
};
