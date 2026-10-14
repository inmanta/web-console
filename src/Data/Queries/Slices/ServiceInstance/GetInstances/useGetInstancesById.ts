import { useContext } from "react";
import { UseQueryResult, useQueries } from "@tanstack/react-query";
import { PageSize, ServiceInstanceModel } from "@/Core";
import { useGet } from "@/Data/Queries/Helpers";
import { DependencyContext } from "@/UI/Dependency";
import { getInstanceKey } from "../GetInstance";
import { getUrl } from "./getUrl";

/**
 * The instance ids to look up: grouped under their service entity when it is known, so each
 * entity's instances come in one request, and on their own otherwise.
 */
export interface InstanceIdLookup {
  byEntity: Record<string, string[]>;
  withoutEntity: string[];
}

/**
 * Collects the instances found so far by id. Defined once, so React Query keeps the same record
 * until a lookup changes.
 *
 * @example combineInstances([{ data: [instance] }, { data: undefined }]) // { [instance.id]: instance }
 */
const combineInstances = (
  results: UseQueryResult<ServiceInstanceModel[]>[]
): Record<string, ServiceInstanceModel> =>
  Object.fromEntries(
    results.flatMap(({ data = [] }) =>
      data.map((instance): [string, ServiceInstanceModel] => [instance.id, instance])
    )
  );

/**
 * React Query hook looking up service instances by id. The ids of a known service entity come in
 * one inventory request per entity, narrowed to the ids like the inventory page's id filter; an id
 * without its entity is looked up on its own. It returns the instances found so far, by id; one
 * that is still loading or failed is missing. Callers only show their names, which rarely change,
 * so a lookup is kept for the session and a failed one isn't retried.
 *
 * @example useGetInstancesById({ byEntity: { lab: ["7cd8...", "91ab..."] }, withoutEntity: ["2f3e..."] }) // { "7cd8...": { id: "7cd8...", ... }, ... }
 */
export const useGetInstancesById = ({
  byEntity,
  withoutEntity,
}: InstanceIdLookup): Record<string, ServiceInstanceModel> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const getInventory = useGet(env)<{ data: ServiceInstanceModel[] }>;
  const getInstance = useGet(env)<{ data: ServiceInstanceModel }>;

  const entityQueries = Object.entries(byEntity).map(([serviceEntity, instanceIds]) => ({
    queryKey: getInstanceKey.list(["by_id", serviceEntity, ...instanceIds, env]),
    queryFn: async () => {
      const { data } = await getInventory(
        getUrl(
          {
            name: serviceEntity,
            filter: { id_or_service_identity: instanceIds },
            pageSize: PageSize.from(String(instanceIds.length)),
            currentPage: { kind: "CurrentPage", value: "" },
          },
          false
        )
      );

      return data;
    },
    staleTime: Infinity,
    retry: false,
  }));

  const instanceQueries = withoutEntity.map((instanceId) => ({
    queryKey: getInstanceKey.single(instanceId, ["by_id", env]),
    queryFn: async () => {
      const { data } = await getInstance(`/lsm/v1/service_inventory?service_id=${instanceId}`);

      return [data];
    },
    staleTime: Infinity,
    retry: false,
  }));

  return useQueries({
    queries: [...entityQueries, ...instanceQueries],
    combine: combineInstances,
  });
};
