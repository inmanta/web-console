import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { InstanceLog } from "@inmanta/web-console-core/Domain/HistoryLog";
import { CustomError, useGet } from "@inmanta/web-console-core/Queries/Helpers";
import { KeyFactory, SliceKeys } from "@inmanta/web-console-core/Queries/Helpers/KeyFactory";

/**
 * The response of the instance log endpoint.
 */
interface Response {
  data: InstanceLog[];
}

/**
 * React Query hook fetching the history log of one instance version of a service instance. The
 * result is null when the instance has no such version. Doesn't fetch until the service entity,
 * instance id and instance version are known.
 *
 * @example useGetInstanceLog("lsp", "abc", 4).data // { version: 4, state: "up", ... }
 */
export const useGetInstanceLog = (
  serviceEntity: string | undefined,
  instanceId: string | undefined,
  instanceVersion: number | undefined
): UseQueryResult<InstanceLog | null, CustomError> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Response>;

  return useQuery({
    queryKey: getInstanceLogKey.single(instanceId ?? "", [
      { service: serviceEntity ?? "" },
      String(instanceVersion),
      env,
    ]),
    queryFn: () =>
      get(
        `/lsm/v1/service_inventory/${serviceEntity}/${instanceId}/log?limit=1&filter.version=ge:${instanceVersion}&filter.version=le:${instanceVersion}`
      ),
    enabled:
      serviceEntity !== undefined && instanceId !== undefined && instanceVersion !== undefined,
    select: (response) => response.data[0] ?? null,
  });
};

export const getInstanceLogKey = new KeyFactory(SliceKeys.serviceInstance, "get_instance_log");
