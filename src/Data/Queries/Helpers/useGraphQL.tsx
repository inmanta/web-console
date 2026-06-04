import { request } from "graphql-request";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "./useFetchHelpers";

/**
 * Hook that provides GraphQL request functionality.
 *
 * This hook creates a GraphQL request with proper headers and base URL configuration.
 *
 * @param {string} query - The GraphQL query string to be executed
 * @param {Record<string, unknown>} [variables] - Optional GraphQL variables
 * @returns {Promise<any>} A promise that resolves to the GraphQL response data
 *
 * @example
 * const query = gql`
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
  const { createHeaders } = useFetchHelpers();
  const headers = createHeaders();

  return () => request(baseUrl + "/api/v2/graphql", query, variables, headers);
}
