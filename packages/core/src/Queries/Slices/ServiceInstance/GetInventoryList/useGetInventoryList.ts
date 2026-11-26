import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceInstanceModel } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { CustomError, useGet } from "@inmanta/web-console-core/Queries/Helpers";
import { KeyFactory, SliceKeys } from "@inmanta/web-console-core/Queries/Helpers/KeyFactory";

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
interface GetInventoryList {
  useOneTime: (enabled?: boolean) => UseQueryResult<Inventories, CustomError>;
}

/**
 * React Query hook to fetch the service inventory of each service in the list of service names.
 *
 * @param {string[]} serviceNames - the  array of service names
 *
 * @returns {GetInventoryList} An object containing the different available queries.
 * @returns {UseQueryResult<Inventories, CustomError>} returns.useOneTime - Fetch the service
 *   inventories once. A response can be large, so it isn't polled or fetched again when the window
 *   gets focus; `refetch` fetches it again. It only fetches while `enabled` (default true).
 */
export const useGetInventoryList = (serviceNames: string[]): GetInventoryList => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<{ data: ServiceInstanceModel[] }>;

  /**
   * Fetches the inventory for all services.
   *
   * @returns A promise that resolves to an object mapping service names to arrays of service instances.
   * @throws Will throw an error if the fetch operation for any service fails.
   */
  const fetchAllServices = async (): Promise<Inventories> => {
    const responses = await Promise.all(
      serviceNames.map(async (serviceName) =>
        get(`/lsm/v1/service_inventory/${serviceName}?limit=1000`)
      )
    );

    // Map the responses to an object of service names and arrays of service instances for each service
    return Object.fromEntries(
      responses.map((response, index) => [serviceNames[index], response.data])
    );
  };

  return {
    useOneTime: (enabled = true): UseQueryResult<Inventories, CustomError> =>
      useQuery({
        enabled,
        queryKey: getInventoryListKey.list([...serviceNames, env]),
        queryFn: fetchAllServices,
        refetchOnWindowFocus: false,
      }),
  };
};

export const getInventoryListKey = new KeyFactory(SliceKeys.serviceInstance, "get_inventory_list");
