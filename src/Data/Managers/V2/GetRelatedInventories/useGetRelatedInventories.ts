import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceInstanceModel } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../helpers";

export interface InventoriesResponse {
  [key: string]: ServiceInstanceModel[];
}
/**
 * Return Signature of the useGetRelatedInventories React Query
 */
interface GetRelatedInventories {
  useOneTime: () => UseQueryResult<InventoriesResponse, Error>;
  useContinuous: () => UseQueryResult<InventoriesResponse, Error>;
}

/**
 * React Query hook to fetch the service inventory of each service in the list of service names.
 *
 * @param {string[]} serviceNames - the  array of service names
 * @param environment {string} - the environment in which the instance belongs
 *
 * @returns {GetRelatedInventories} An object containing the different available queries.
 * @returns {UseQueryResult<InventoriesResponse, Error>} returns.useOneTime - Fetch the service inventories as a single query.
 * @returns {UseQueryResult<InventoriesResponse, Error>} returns.useContinuous - Fetch the service inventories  with a recursive query with an interval of 5s.
 */
export const useGetRelatedInventories = (
  serviceNames: string[] | undefined,
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

  const fetchServices = async (): Promise<InventoriesResponse> => {
    if (serviceNames == undefined) {
      return Promise.resolve({}); //this is to avoid the typescript error, but it should never happen as the hook is disabled when serviceNames is undefined
    }

    const responses = await Promise.all(
      serviceNames.map(async (serviceName) => await fetchService(serviceName)),
    );
    const responsesAsObject = {} as { [key: string]: ServiceInstanceModel[] };

    //Promise.all returns an array of responses in the same order as they were initially provided so we can map them to the service names
    responses.forEach((response, index) => {
      responsesAsObject[serviceNames[index]] = response.data;
    });
    return responsesAsObject;
  };

  return {
    useOneTime: (): UseQueryResult<InventoriesResponse, Error> =>
      useQuery({
        queryKey: ["get_related_catalogs-one_time", serviceNames],
        queryFn: fetchServices,
        retry: false,
        enabled: serviceNames !== undefined,
      }),
    useContinuous: (): UseQueryResult<InventoriesResponse, Error> =>
      useQuery({
        queryKey: ["get_related_catalogs-continuous", serviceNames],
        queryFn: fetchServices,
        refetchInterval: 5000,
        enabled: serviceNames !== undefined,
      }),
  };
};
