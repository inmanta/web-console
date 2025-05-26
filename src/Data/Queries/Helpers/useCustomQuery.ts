import { UseQueryOptions, UseQueryResult, useQuery } from "@tanstack/react-query";
import { useQueryControl } from "./QueryControlContext";

/**
 * Wrapper for React Query hook for queries.
 *
 * It adds a layer of control over the query execution to prevent executing queries, through the useQuery `enabled` flag, when the environment is halted.
 *
 * @param { UseQueryOptions<TData, TError>} options - The options for the query.
 * @returns  { UseQueryResult<TData, TError>} The query result.
 */
export function useCustomQuery<TData = unknown, TError = Error>(
  options: UseQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  const { queriesEnabled } = useQueryControl();

  return useQuery({
    ...options,
    enabled: queriesEnabled && options.enabled !== false,
  });
}
