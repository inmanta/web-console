import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Resource } from "@/Core/Domain";
import { REFETCH_INTERVAL, useGet } from "../../helpers";

/**
 * Interface for the API response containing the resource details for a desired state version
 */
interface Result {
  data: Resource.VersionedDetails;
}

/**
 * Return signature of the useGetDesiredStateResourceDetails React Query hook
 */
interface GetDesiredStateResourceDetails {
  useOneTime: () => UseQueryResult<Resource.VersionedDetails, Error>;
  useContinuous: () => UseQueryResult<Resource.VersionedDetails, Error>;
}

/**
 * React Query hook to fetch resource details from a specific desired state version
 *
 * @returns {GetDesiredStateResourceDetails} An object containing the available queries.
 * @returns {UseQueryResult<Resource.VersionedDetails, Error>} returns.useOneTime - Fetch the resource details with a single query.
 * @returns {UseQueryResult<Resource.VersionedDetails, Error>} returns.useContinuous - Fetch the resource details with a recurrent query with an interval of 5s.
 */
export const useGetDesiredStateResourceDetails = (
  version: string,
  id: string
): GetDesiredStateResourceDetails => {
  const get = useGet({})<Result>;

  return {
    useOneTime: (): UseQueryResult<Resource.VersionedDetails, Error> =>
      useQuery({
        queryKey: ["get_desired_state_resource_details-one_time", version, id],
        queryFn: () => get(getUrl(version, id)),
        select: (data) => data.data,
      }),
    useContinuous: (): UseQueryResult<Resource.VersionedDetails, Error> =>
      useQuery({
        queryKey: ["get_desired_state_resource_details-continuous", version, id],
        queryFn: () => get(getUrl(version, id)),
        refetchInterval: REFETCH_INTERVAL,
        select: (data) => data.data,
      }),
  };
};

function getUrl(version: string, id: string): string {
  return `/api/v2/desiredstate/${version}/resource/${id}`;
}
