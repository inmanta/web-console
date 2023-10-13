import { identity } from "lodash-es";
import { KeyMaker, Scheduler, ApiHelper, StateHelperWithEnv } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";

export function ServiceQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelperWithEnv<"GetService">,
  scheduler: Scheduler,
  keyMaker: KeyMaker<[string, string]>,
) {
  return QueryManager.ContinuousWithEnv<"GetService">(
    apiHelper,
    stateHelper,
    scheduler,
    ({ name }, environment) => keyMaker.make([environment, name]),
    ({ name }, environment) => [name, environment],
    "GetService",
    ({ name }) => `/lsm/v1/service_catalog/${name}?instance_summary=True`,
    identity,
  );
}

export function GetServiceOneTimeQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelperWithEnv<"GetService">,
) {
  return QueryManager.OneTimeWithEnv<"GetService">(
    apiHelper,
    stateHelper,
    ({ name }, environment) => [name, environment],
    "GetService",
    ({ name }) => `/lsm/v1/service_catalog/${name}?instance_summary=True`,
    identity,
    "MERGE",
  );
}
