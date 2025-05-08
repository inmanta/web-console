import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Resource } from "@/Core/Domain";
import { useGet, REFETCH_INTERVAL } from "../../helpers";

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
  const get = useGet()<Response>;

  return {
    useContinuous: (id: string): UseQueryResult<Resource.Details, Error> =>
      useQuery({
        queryKey: ["get_resource_details-continuous", id],
        queryFn: () => get(`/api/v2/resource/${encodeURIComponent(id)}`),
        select: (data) => data.data,
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};
