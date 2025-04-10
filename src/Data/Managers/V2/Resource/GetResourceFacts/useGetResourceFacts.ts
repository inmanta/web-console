import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Fact } from "@/Slices/Facts/Core/Domain";
import { useGet, REFETCH_INTERVAL } from "../../helpers";
import { getUrl } from "./getUrl";

/**
 * Result interface for the resource facts API response
 */
interface Result {
  data: Fact[];
}

/**
 * Return signature of the useGetResourceFacts React Query hook
 */
interface GetResourceFacts {
  useOneTime: (resourceId: string) => UseQueryResult<Fact[], Error>;
  useContinuous: (resourceId: string) => UseQueryResult<Fact[], Error>;
}

/**
 * React Query hook to fetch facts for a specific resource
 *
 * @returns {GetResourceFacts} An object containing the available queries
 * @returns {UseQueryResult<Result, Error>} returns.useOneTime - Fetch the resource facts with a single query
 * @returns {UseQueryResult<Result, Error>} returns.useContinuous - Fetch the resource facts with a recurrent query with an interval of 5s
 */
export const useGetResourceFacts = (): GetResourceFacts => {
  const get = useGet()<Result>;

  return {
    useOneTime: (resourceId: string): UseQueryResult<Fact[], Error> =>
      useQuery({
        queryKey: ["get_resource_facts-one_time", resourceId],
        queryFn: () => get(getUrl(resourceId)),
        select: (data) => data.data,
      }),
    useContinuous: (resourceId: string): UseQueryResult<Fact[], Error> =>
      useQuery({
        queryKey: ["get_resource_facts-continuous", resourceId],
        queryFn: () => get(getUrl(resourceId)),
        select: (data) => data.data,
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};
