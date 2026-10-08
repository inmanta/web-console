import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { InstanceLog } from "@/Core/Domain/HistoryLog";
import { useGet } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";

/**
 * The response of the instance log endpoint.
 */
interface Response {
  data: InstanceLog[];
}

/**
 * React Query hook looking up one version of a service instance by its number. The result is null
 * when the instance has no such version. It stays idle until both the instance and the version
 * are known.
 *
 * @example useGetInstanceVersion({ serviceEntity: "lsp", id: "abc" }, 4).data // { version: 4, state: "up", ... }
 */
export const useGetInstanceVersion = (
  instance: { serviceEntity: string; id: string } | undefined,
  version: number | undefined
): UseQueryResult<InstanceLog | null, Error> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Response>;

  return useQuery({
    queryKey: getInstanceVersionKey.single(instance?.id ?? "", [String(version), env]),
    queryFn: () =>
      get(
        `/lsm/v1/service_inventory/${instance?.serviceEntity}/${instance?.id}/log?limit=1&filter.version=ge:${version}&filter.version=le:${version}`
      ),
    enabled: instance !== undefined && version !== undefined,
    select: (response) => response.data[0] ?? null,
  });
};

export const getInstanceVersionKey = new KeyFactory(
  SliceKeys.serviceInstance,
  "get_instance_version"
);
