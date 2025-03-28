import {
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import { useQueryControl } from "./QueryControlContext";

export function useControlledQuery<TData = unknown, TError = Error>(
  options: UseQueryOptions<TData, TError>,
): UseQueryResult<TData, TError> {
  const { queriesEnabled } = useQueryControl();

  return useQuery({
    ...options,
    enabled: queriesEnabled && options.enabled !== false,
  });
}
