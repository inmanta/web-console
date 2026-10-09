import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { InstanceLog } from "@/Core/Domain/HistoryLog";
import { CustomError, useGet } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";

/**
 * The response of the instance log endpoint.
 */
interface Response {
  data: InstanceLog[];
}

/**
 * React Query hook fetching the history log of one version of a service instance. The result is
 * null when the instance has no such version. Doesn't fetch until the service, instance and
 * version are known.
 *
 * @example useGetInstanceLog("lsp", "abc", 4).data // { version: 4, state: "up", ... }
 */
export const useGetInstanceLog = (
  service: string | undefined,
  instance: string | undefined,
  version: number | undefined
): UseQueryResult<InstanceLog | null, CustomError> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Response>;

  return useQuery({
    queryKey: getInstanceLogKey.single(instance ?? "", [
      { service: service ?? "" },
      String(version),
      env,
    ]),
    queryFn: () =>
      get(
        `/lsm/v1/service_inventory/${service}/${instance}/log?limit=1&filter.version=ge:${version}&filter.version=le:${version}`
      ),
    enabled: service !== undefined && instance !== undefined && version !== undefined,
    select: (response) => response.data[0] ?? null,
  });
};

export const getInstanceLogKey = new KeyFactory(SliceKeys.serviceInstance, "get_instance_log");
