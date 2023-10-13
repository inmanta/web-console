import { identity } from "lodash-es";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";

export function DiagnosticsQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelper<"GetDiagnostics">,
  scheduler: Scheduler,
) {
  return QueryManager.ContinuousWithEnv<"GetDiagnostics">(
    apiHelper,
    stateHelper,
    scheduler,
    ({ kind, id }) => `${kind}_${id}`,
    ({ id, service_entity }) => [id, service_entity],
    "GetDiagnostics",
    ({ service_entity, id }) =>
      `/lsm/v1/service_inventory/${service_entity}/${id}/diagnose`,
    identity,
  );
}
