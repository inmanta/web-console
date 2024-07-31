import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceInstanceModel } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../helpers";

/**
 * Inventories interface
 *
 * It is used to group service instances by a service name
 *
 */
export interface Inventories {
  [serviceName: string]: ServiceInstanceModel[];
}

/**
 * Return Signature of the useGetRelatedInventories React Query
 */
interface GetRelatedInventories {
  useOneTime: () => UseQueryResult<Inventories, Error>;
  useContinuous: () => UseQueryResult<Inventories, Error>;
}

/**
 * React Query hook to fetch the service inventory of each service in the list of service names.
 *
 * @param {string[]} serviceNames - the  array of service names
 * @param environment {string} - the environment in which the instance belongs
 *
 * @returns {GetRelatedInventories} An object containing the different available queries.
 * @returns {UseQueryResult<Inventories, Error>} returns.useOneTime - Fetch the service inventories as a single query.
 * @returns {UseQueryResult<Inventories, Error>} returns.useContinuous - Fetch the service inventories  with a recursive query with an interval of 5s.
 */
export const useGetRelatedInventories = (
  serviceNames: string[],
  environment: string,
): GetRelatedInventories => {
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  const fetchService = async (
    service: string,
  ): Promise<{ data: ServiceInstanceModel[] }> => {
    const response = await fetch(
      `${baseUrl}/lsm/v1/service_inventory/${service}`,
      {
        headers,
      },
    );

    await handleErrors(
      response,
      `Failed to fetch service inventory for name: ${service}`,
    );

    return response.json();
  };

  const fetchServices = async (): Promise<Inventories> => {
    const responses = await Promise.all(
      serviceNames.map(async (serviceName) => await fetchService(serviceName)),
    );

    return Object.fromEntries(
      responses.map((response, index) => [serviceNames[index], response.data]),
    );
  };

  return {
    useOneTime: (): UseQueryResult<Inventories, Error> =>
      useQuery({
        queryKey: ["get_related_inventories-one_time", serviceNames],
        queryFn: fetchServices,
        retry: false,
      }),
    useContinuous: (): UseQueryResult<Inventories, Error> =>
      useQuery({
        queryKey: ["get_related_inventories-continuous", serviceNames],
        queryFn: fetchServices,
        refetchInterval: 5000,
      }),
  };
};
