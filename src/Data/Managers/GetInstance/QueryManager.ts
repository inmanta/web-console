import { identity } from "lodash-es";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";

export function ServiceInstanceQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelper<"GetServiceInstance">,
  scheduler: Scheduler
) {
  return QueryManager.ContinuousWithEnv<"GetServiceInstance">(
    apiHelper,
    stateHelper,
    scheduler,
    ({ kind, id }) => `${kind}_${id}`,
    ({ id }) => [id],
    "GetServiceInstance",
    ({ service_entity, id }) =>
      `/lsm/v1/service_inventory/${service_entity}/${id}`,
    identity
  );
}

export function GetServiceInstanceOneTimeQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelper<"GetServiceInstance">
) {
  return QueryManager.OneTimeWithEnv<"GetServiceInstance">(
    apiHelper,
    stateHelper,
    ({ id }) => [id],
    "GetServiceInstance",
    ({ service_entity, id }) =>
      `/lsm/v1/service_inventory/${service_entity}/${id}`,
    identity,
    "MERGE"
  );
}
