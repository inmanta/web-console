import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { InstanceResourceModel } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../../helpers";

/**
 * Return Signature of the useGetInstanceResources React Query
 */
interface getInstanceResources {
  useOneTime: () => UseQueryResult<InstanceResourceModel[], Error>;
  useContinuous: () => UseQueryResult<InstanceResourceModel[], Error>;
}

/**
 * React Query hook to fetch the resources for given service instance
 *
 * @param {string} id - the service instance id
 * @param {string} serviceName - the service name
 * @param environment {string} - the environment in which the instance belongs
 *
 * @returns {getInstanceResources} An object containing the different available queries.
 * @returns {UseQueryResult<InstanceResourceModel[], Error>} returns.useOneTime - Fetch the service instance resources ies as a single query.
 * @returns {UseQueryResult<InstanceResourceModel[], Error>} returns.useContinuous - Fetch the service instance resources with a recursive query with an interval of 5s.
 */
export const useGetInstanceResources = (
  id: string,
  service_entity: string,
  version: string,
  environment: string,
): getInstanceResources => {
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Fetches the all the resources for a given service instance.
   *
   * @returns A promise that resolves to an object containing an array of service instance resources
   * @throws Will throw an error if the fetch operation fails.
   */
  const fetchResources = async (): Promise<{
    data: InstanceResourceModel[];
  }> => {
    const response = await fetch(
      `${baseUrl}/lsm/v1/service_inventory/${service_entity}/${id}/resources?current_version=${version}`,
      {
        headers,
      },
    );

    await handleErrors(
      response,
      `Failed to fetch service instance resources for instance of id: ${id}`,
    );

    return response.json();
  };

  return {
    useOneTime: (): UseQueryResult<InstanceResourceModel[], Error> =>
      useQuery({
        queryKey: ["get_instance_resources-one_time", id],
        queryFn: fetchResources,
        retry: false,
      }),
    useContinuous: (): UseQueryResult<InstanceResourceModel[], Error> =>
      useQuery({
        queryKey: ["get_instance_resources-continuous", id],
        queryFn: fetchResources,
        refetchInterval: 5000,
        select: (data): InstanceResourceModel[] => data.data,
        retry: false,
      }),
  };
};
