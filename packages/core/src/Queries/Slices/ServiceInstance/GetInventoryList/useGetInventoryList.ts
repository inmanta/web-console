import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Pagination, ServiceInstanceModel } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { CustomError, useGet, REFETCH_INTERVAL } from "@inmanta/web-console-core/Queries/Helpers";
import { KeyFactory, SliceKeys } from "@inmanta/web-console-core/Queries/Helpers/KeyFactory";

/**
 * Inventories interface
 *
 * It is used to group service instances by a service name
 */
export interface Inventories {
  [serviceName: string]: ServiceInstanceModel[];
}

/** The number of instances fetched per page: few requests for a large inventory. */
const PAGE_SIZE = 1000;

/**
 * Return Signature of the useGetInventoryList React Query
 */
interface GetInventoryList {
  useOneTime: () => UseQueryResult<Inventories, CustomError>;
  useContinuous: () => UseQueryResult<Inventories, CustomError>;
  useContinuousNoRefetch: () => UseQueryResult<Inventories, CustomError>;
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
  const get = useGet(env)<{ data: ServiceInstanceModel[]; links?: Pagination.Links }>;

  /**
   * Fetches every instance of one service: each page in turn, following `links.next`. A next link
   * to the page it was on ends it, so it never fetches the same page forever.
   *
   * @param serviceName - the service
   * @returns the instances of the service
   * @throws Will throw an error if the fetch of any page fails.
   */
  const fetchService = async (serviceName: string): Promise<ServiceInstanceModel[]> => {
    const instances: ServiceInstanceModel[] = [];
    let query: string | undefined = `limit=${PAGE_SIZE}`;

    while (query !== undefined) {
      const page = await get(`/lsm/v1/service_inventory/${serviceName}?${query}`);

      instances.push(...page.data);
      const next = page.links?.next?.split("?")[1];

      query = next !== query ? next : undefined;
    }

    return instances;
  };

  /**
   * Fetches the inventory for all services, in parallel.
   *
   * @returns A promise that resolves to an object mapping service names to arrays of service instances.
   * @throws Will throw an error if the fetch operation for any service fails.
   */
  const fetchAllServices = async (): Promise<Inventories> => {
    const inventories = await Promise.all(serviceNames.map(fetchService));

    return Object.fromEntries(
      inventories.map((instances, index) => [serviceNames[index], instances])
    );
  };

  return {
    useOneTime: (): UseQueryResult<Inventories, CustomError> =>
      useQuery({
        queryKey: getInventoryListKey.list([...serviceNames, env]),
        queryFn: fetchAllServices,
      }),
    useContinuous: (): UseQueryResult<Inventories, CustomError> =>
      useQuery({
        queryKey: getInventoryListKey.list([...serviceNames, env]),
        queryFn: fetchAllServices,
        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
      }),
    useContinuousNoRefetch: (): UseQueryResult<Inventories, CustomError> =>
      useQuery({
        queryKey: getInventoryListKey.list([...serviceNames, env]),
        queryFn: fetchAllServices,
        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
        refetchOnWindowFocus: false,
      }),
  };
};

export const getInventoryListKey = new KeyFactory(SliceKeys.serviceInstance, "get_inventory_list");
