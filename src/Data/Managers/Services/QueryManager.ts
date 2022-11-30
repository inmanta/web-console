import { identity } from "lodash-es";
import { Scheduler, ApiHelper, StateHelperWithEnv } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";

export function ServicesQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelperWithEnv<"GetServices">,
  scheduler: Scheduler
) {
  return QueryManager.ContinuousWithEnv<"GetServices">(
    apiHelper,
    stateHelper,
    scheduler,
    ({ kind }, environment) => `${kind}_${environment}`,
    () => [],
    "GetServices",
    () => `/lsm/v1/service_catalog?instance_summary=True`,
    identity
  );
}
