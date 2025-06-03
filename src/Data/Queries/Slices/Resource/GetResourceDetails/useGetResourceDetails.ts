import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Resource } from "@/Core/Domain";
import { useGet, REFETCH_INTERVAL, KeyFactory, keySlices } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";

/**
 * Resource.Details interface for the resource details API response
 */
interface Response {
  data: Resource.Details;
}

/**
 * Return signature of the useGetResourceDetails React Query hook
 */
interface GetResourceDetails {
  useContinuous: (id: string) => UseQueryResult<Resource.Details, Error>;
}

/**
 * React Query hook to fetch details of a specific resource
 *
 * @returns {GetResourceDetails} An object containing the available queries
 * @returns {UseQueryResult<Resource.Details, Error>} returns.useContinuous - Fetch the resource details with a recurrent query with an interval of 5s
 */
export const useGetResourceDetails = (): GetResourceDetails => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Response>;
  const keyFactory = new KeyFactory(keySlices.resource, "get_resource_details");

  return {
    useContinuous: (id: string): UseQueryResult<Resource.Details, Error> =>
      useQuery({
        queryKey: keyFactory.single(id, [env]),
        queryFn: () => get(`/api/v2/resource/${encodeURIComponent(id)}`),
        select: (data) => data.data,
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};
