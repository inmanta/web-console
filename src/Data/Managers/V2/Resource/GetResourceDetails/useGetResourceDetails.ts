import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Resource } from "@/Core/Domain";
import { useGet } from "../../helpers";
import { getUrl } from "./getUrl";

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
  useOneTime: (id: string) => UseQueryResult<Resource.Details, Error>;
  useContinuous: (id: string) => UseQueryResult<Resource.Details, Error>;
}

/**
 * React Query hook to fetch details of a specific resource
 *
 * @returns {GetResourceDetails} An object containing the available queries
 * @returns {UseQueryResult<Resource.Details, Error>} returns.useOneTime - Fetch the resource details with a single query
 * @returns {UseQueryResult<Resource.Details, Error>} returns.useContinuous - Fetch the resource details with a recurrent query with an interval of 5s
 */
export const useGetResourceDetails = (): GetResourceDetails => {
  const get = useGet()<Response>;

  return {
    useOneTime: (id: string): UseQueryResult<Resource.Details, Error> =>
      useQuery({
        queryKey: ["get_resource_details-one_time", id],
        queryFn: () => get(getUrl(id)),
        select: (data) => data.data,
      }),
    useContinuous: (id: string): UseQueryResult<Resource.Details, Error> =>
      useQuery({
        queryKey: ["get_resource_details-continuous", id],
        queryFn: () => get(getUrl(id)),
        select: (data) => data.data,
        refetchInterval: 5000,
      }),
  };
};
