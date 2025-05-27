import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Resource } from "@/Core/Domain";
import { KeyFactory, keySlices } from "@/Data/Managers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";
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
  useContinuous: () => UseQueryResult<Resource.VersionedDetails, Error>;
}

/**
 * React Query hook to fetch resource details from a specific desired state version
 *
 * @returns {GetDesiredStateResourceDetails} An object containing the available queries.
 * @returns {UseQueryResult<Resource.VersionedDetails, Error>} returns.useContinuous - Fetch the resource details with a recurrent query with an interval of 5s.
 */
export const useGetDesiredStateResourceDetails = (
  version: string,
  id: string
): GetDesiredStateResourceDetails => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Result>;
  const keyFactory = new KeyFactory(keySlices.desiredState, "get_desired_state_resource_details");

  return {
    useContinuous: (): UseQueryResult<Resource.VersionedDetails, Error> =>
      useQuery({
        queryKey: keyFactory.single(id, [version, env]),
        queryFn: () => get(getUrl(version, id)),
        select: (data) => data.data,
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};

function getUrl(version: string, id: string): string {
  return `/api/v2/desiredstate/${version}/resource/${encodeURIComponent(id)}`;
}
