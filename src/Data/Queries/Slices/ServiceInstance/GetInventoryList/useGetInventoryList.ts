import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceInstanceModel } from "@/Core";
import { KeyFactory, keySlices } from "@/Data/Managers/KeyFactory";
import { CustomError, useGet, REFETCH_INTERVAL } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";

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
  useOneTime: () => UseQueryResult<Inventories, CustomError>;
  useContinuous: () => UseQueryResult<Inventories, CustomError>;
}

/**
 * React Query hook to fetch the service inventory of each service in the list of service names.
 *
 * @param {string[]} serviceNames - the  array of service names
 *
 * @returns {GetInventoryList} An object containing the different available queries.
 * @returns {UseQueryResult<Inventories, CustomError>} returns.useOneTime - Fetch the service inventories as a single query.
 * @returns {UseQueryResult<Inventories, CustomError>} returns.useContinuous - Fetch the service inventories  with a recursive query with an interval of 5s.
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

  const keyFactory = new KeyFactory(keySlices.serviceInstance, "get_inventory_list");

  return {
    useOneTime: (): UseQueryResult<Inventories, CustomError> =>
      useQuery({
        queryKey: keyFactory.list([...serviceNames, env]),
        queryFn: fetchAllServices,
      }),
    useContinuous: (): UseQueryResult<Inventories, CustomError> =>
      useQuery({
        queryKey: keyFactory.list([...serviceNames, env]),
        queryFn: fetchAllServices,
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};
