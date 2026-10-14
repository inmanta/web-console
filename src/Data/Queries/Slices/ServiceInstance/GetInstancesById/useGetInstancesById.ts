import { useContext } from "react";
import { UseQueryResult, useQueries } from "@tanstack/react-query";
import { ServiceInstanceModel } from "@/Core";
import { useGet } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";

/**
 * Reads the instance out of the inventory response.
 *
 * @example selectInstance({ data: instance }) // instance
 */
const selectInstance = (response: { data: ServiceInstanceModel }): ServiceInstanceModel =>
  response.data;

/**
 * Collects the instances found so far by id. Defined once, so React Query keeps the same record
 * until a lookup changes.
 *
 * @example combineInstances([{ data: instance }, { data: undefined }]) // { [instance.id]: instance }
 */
const combineInstances = (
  results: UseQueryResult<ServiceInstanceModel>[]
): Record<string, ServiceInstanceModel> =>
  Object.fromEntries(
    results.flatMap(({ data }): [string, ServiceInstanceModel][] => (data ? [[data.id, data]] : []))
  );

/**
 * React Query hook looking up service instances by id alone, without their service entity. It
 * returns the instances found so far, by id; one that is still loading or failed is missing.
 * Callers only show their names, which rarely change, so a lookup is kept for the session and a
 * failed one (a deleted instance) isn't retried. Each id is fetched once, however many callers
 * ask for it.
 *
 * @example useGetInstancesById(["7cd8..."]) // { "7cd8...": { id: "7cd8...", service_entity: "l2Connect", ... } }
 */
export const useGetInstancesById = (
  instanceIds: string[]
): Record<string, ServiceInstanceModel> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<{ data: ServiceInstanceModel }>;

  return useQueries({
    queries: instanceIds.map((instanceId) => ({
      queryKey: getInstanceByIdKey.single(instanceId, [env]),
      queryFn: () => get(`/lsm/v1/service_inventory?service_id=${instanceId}`),
      select: selectInstance,
      staleTime: Infinity,
      retry: false,
    })),
    combine: combineInstances,
  });
};

export const getInstanceByIdKey = new KeyFactory(SliceKeys.serviceInstance, "get_instance_by_id");
