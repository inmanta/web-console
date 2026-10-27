import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { useGet, REFETCH_INTERVAL } from "@inmanta/web-console-core/Queries/Helpers";
import { KeyFactory, SliceKeys } from "@inmanta/web-console-core/Queries/Helpers/KeyFactory";
import type { DiscoveredResource } from "./useGetDiscoveredResources";

/**
 * DiscoveredResource interface for the resource details API response
 */
interface Response {
  data: DiscoveredResource;
}

/**
 * Return signature of the useGetDiscoveredResourceDetails React Query hook
 */
interface GetDiscoveredResourceDetails {
  useContinuous: (id: string) => UseQueryResult<DiscoveredResource, Error>;
}

/**
 * React Query hook to fetch details of a specific discovered resource
 *
 * @returns {GetDiscoveredResourceDetails} An object containing the available queries
 * @returns {UseQueryResult<DiscoveredResource, Error>} returns.useContinuous - Fetch the discovered resource details with a recurrent query with an interval of 5s
 */
export const useGetDiscoveredResourceDetails = (): GetDiscoveredResourceDetails => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Response>;

  return {
    useContinuous: (id: string): UseQueryResult<DiscoveredResource, Error> =>
      useQuery({
        queryKey: getDiscoveredResourceDetailsKey.single(id, [env]),
        queryFn: () => get(`/api/v2/discovered/${encodeURIComponent(id)}`),
        select: (data) => data.data,
        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
      }),
  };
};

export const getDiscoveredResourceDetailsKey = new KeyFactory(
  SliceKeys.discoveredResource,
  "get_discovered_resource_details"
);
