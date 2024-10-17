import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceInstanceModel } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../../helpers";

/**
 * Inventories interface
 *
 * It is used to group service instances by a service name
 */
export interface Inventories {
  [serviceName: string]: ServiceInstanceModel[];
}

/**
 * Return Signature of the useGetInventoryList React Query
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
export const useGetInventoryList = (
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

  /**
   * Fetches the inventory for a single service.
   *
   * @param service - The name of the service to fetch the inventory for.
   * @returns A promise that resolves to an object containing an array of service instance models.
   * @throws Will throw an error if the fetch operation fails.
   */
  const fetchSingleService = async (
    service: string,
  ): Promise<{ data: ServiceInstanceModel[] }> => {
    const response = await fetch(
      `${baseUrl}/lsm/v1/service_inventory/${service}?limit=1000`,
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

  /**
   * Fetches the inventory for all services.
   *
   * @returns A promise that resolves to an object mapping service names to arrays of service instances.
   * @throws Will throw an error if the fetch operation for any service fails.
   */
  const fetchAllServices = async (): Promise<Inventories> => {
    const responses = await Promise.all(
      serviceNames.map(
        async (serviceName) => await fetchSingleService(serviceName),
      ),
    );

    // Map the responses to an object of service names and arrays of service instances for each service
    return Object.fromEntries(
      responses.map((response, index) => [serviceNames[index], response.data]),
    );
  };

  return {
    useOneTime: (): UseQueryResult<Inventories, Error> =>
      useQuery({
        queryKey: ["get_inventory__list-one_time", serviceNames],
        queryFn: fetchAllServices,
        retry: false,
      }),
    useContinuous: (): UseQueryResult<Inventories, Error> =>
      useQuery({
        queryKey: ["get_inventory__list-continuous", serviceNames],
        queryFn: fetchAllServices,
        refetchInterval: 5000,
      }),
  };
};
