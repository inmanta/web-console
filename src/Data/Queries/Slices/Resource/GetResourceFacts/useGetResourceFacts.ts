import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { useGet, REFETCH_INTERVAL, KeyFactory, SliceKeys } from "@/Data/Queries";
import { Fact } from "@/Slices/Facts/Core/Domain";
import { DependencyContext } from "@/UI/Dependency";

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
  useContinuous: (resourceId: string) => UseQueryResult<Fact[], Error>;
}

/**
 * React Query hook to fetch facts for a specific resource
 *
 * @returns {GetResourceFacts} An object containing the available queries
 * @returns {UseQueryResult<Result, Error>} returns.useContinuous - Fetch the resource facts with a recurrent query with an interval of 5s
 */
export const useGetResourceFacts = (): GetResourceFacts => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Result>;

  return {
    useContinuous: (resourceId: string): UseQueryResult<Fact[], Error> =>
      useQuery({
        queryKey: getResourceFactsFactory.single(resourceId, [env]),
        queryFn: () => get(`/api/v2/resource/${encodeURIComponent(resourceId)}/facts`),
        select: (data) => data.data,
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};

export const getResourceFactsFactory = new KeyFactory(SliceKeys.resource, "get_resource_facts");
