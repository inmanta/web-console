import { UseQueryOptions, UseQueryResult, useMutation, useQuery } from "@tanstack/react-query";
import { useQueryControl } from "./QueryControlContext";

/**
 * Wrapper for React Query hook for controlled queries.
 *
 * @param { UseQueryOptions<TData, TError>} options - The options for the query.
 * @returns  { UseQueryResult<TData, TError>} The query result.
 */
export function useControlledQuery<TData = unknown, TError = Error>(
  options: UseQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  const { queriesEnabled } = useQueryControl();

  return useQuery({
    ...options,
    enabled: queriesEnabled && options.enabled !== false,
  });
}
