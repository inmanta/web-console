import { PrimaryBaseUrlManager } from "@inmanta/web-console-core/Routing";
import { getRequiredResponseBody, parseJsonResponse, useFetchHelpers } from "./useFetchHelpers";

/**
 * Hook that provides GraphQL request functionality.
 *
 * This hook posts the query to /api/v2/graphql with the same headers and error handling as the REST requests.
 * The promise resolves to the `data` of the server's response envelope, and rejects when the body is empty.
 *
 * @param {string} query - The GraphQL query string to be executed
 * @param {Record<string, unknown>} [variables] - Optional GraphQL variables
 * @returns {Promise<any>} A promise that resolves to the GraphQL response data
 *
 * @example
 * const query = `
 *   query GetResources($filter: ResourceFilter!, $first: Int) {
 *     resources(filter: $filter, first: $first) {
 *       edges {
 *         node {
 *           resourceId
 *         }
 *       }
 *     }
 *   }
 * `;
 *
 * const queryFn = useGraphQLRequest(query, { filter: { environment: envId }, first: 20 });
 *
 * const { data, isLoading, error } = useQuery({
 *   queryKey: ["key"],
 *   queryFn,
 * });
 */
export function useGraphQLRequest<Type>(
  query: string,
  variables?: Record<string, unknown>
): () => Promise<Type> {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const baseUrl = baseUrlManager.getBaseUrl();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders();

  headers.set("Content-Type", "application/json");

  return async () => {
    const response = await fetch(`${baseUrl}/api/v2/graphql`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });

    await handleErrors(response, { method: "POST", path: "/api/v2/graphql" });

    const body = getRequiredResponseBody(await parseJsonResponse<{ data: Type }>(response));

    return body.data;
  };
}
