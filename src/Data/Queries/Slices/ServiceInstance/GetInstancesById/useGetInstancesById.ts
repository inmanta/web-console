import { useContext } from "react";
import { useQueries } from "@tanstack/react-query";
import { ServiceInstanceModel } from "@/Core";
import { useGet } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";

/**
 * React Query hook looking up service instances by id alone, without their service entity. It
 * returns the instances found so far, by id; one that is still loading or failed is missing.
 * Callers only show their names, which rarely change, so a lookup is kept for the session and a
 * failed one (a deleted instance) isn't retried.
 *
 * @example useGetInstancesById(["7cd8..."]) // { "7cd8...": { id: "7cd8...", service_entity: "l2Connect", ... } }
 */
export const useGetInstancesById = (
  instanceIds: string[]
): Record<string, ServiceInstanceModel> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<{ data: ServiceInstanceModel }>;

  const queries = useQueries({
    queries: instanceIds.map((instanceId) => ({
      queryKey: getInstanceByIdKey.single(instanceId, [env]),
      queryFn: () => get(`/lsm/v1/service_inventory?service_id=${instanceId}`),
      select: (response: { data: ServiceInstanceModel }) => response.data,
      staleTime: Infinity,
      retry: false,
    })),
  });

  return Object.fromEntries(
    queries.flatMap(({ data }): [string, ServiceInstanceModel][] => (data ? [[data.id, data]] : []))
  );
};

export const getInstanceByIdKey = new KeyFactory(SliceKeys.serviceInstance, "get_instance_by_id");
