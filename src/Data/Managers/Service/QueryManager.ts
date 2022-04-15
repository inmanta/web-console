import { identity } from "lodash-es";
import { KeyMaker, Scheduler, ApiHelper, StateHelperWithEnv } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";

export class ServiceQueryManager extends QueryManager.ContinuousWithEnv<"GetService"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelperWithEnv<"GetService">,
    scheduler: Scheduler,
    keyMaker: KeyMaker<[string, string]>
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ name }, environment) => keyMaker.make([environment, name]),
      ({ name }, environment) => [name, environment],
      "GetService",
      ({ name }) => `/lsm/v1/service_catalog/${name}?instance_summary=True`,
      identity
    );
  }
}

export class GetServiceOneTimeQueryManager extends QueryManager.OneTimeWithEnv<"GetService"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelperWithEnv<"GetService">
  ) {
    super(
      apiHelper,
      stateHelper,
      ({ name }, environment) => [name, environment],
      "GetService",
      ({ name }) => `/lsm/v1/service_catalog/${name}?instance_summary=True`,
      identity,
      "MERGE"
    );
  }
}
