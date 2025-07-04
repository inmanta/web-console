import { request } from "graphql-request";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "./useFetchHelpers";

/**
 * Hook that provides GraphQL request functionality.
 *
 * This hook creates a GraphQL request with proper headers and base URL configuration.
 * At the time of implementation, our GraphQL endpoint does not support variables in requests,
 * so queries need to be modified at creation time.
 *
 * @param {string} query - The GraphQL query string to be executed
 * @returns {Promise<any>} A promise that resolves to the GraphQL response data
 *
 * @example
 * const query = gql`
 *   query {
 *     notifications {
 *       edges {
 *         node {
 *           title
 *         }
 *       }
 *     }
 *   }
 * `;
 *
 * const queryFn = useGraphQLRequest(query);
 *
 * const { data, isLoading, error } = useQuery({
 *   queryKey: ["key"],
 *   queryFn,
 * });
 */
export function useGraphQLRequest<Type>(query: string): () => Promise<Type> {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const baseUrl = baseUrlManager.getBaseUrl(import.meta.env.VITE_API_BASEURL);
  const { createHeaders } = useFetchHelpers();
  const headers = createHeaders();
  headers.set("Content-Type", "application/graphql");

  const variables = undefined; //currently variables are not supported on our backend and we need to modify query on the creation

  return () => request(baseUrl + "/api/v2/graphql", query, variables, headers);
}
