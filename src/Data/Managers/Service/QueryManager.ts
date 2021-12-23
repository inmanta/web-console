import { identity } from "lodash";
import { KeyMaker, Scheduler, ApiHelper, StateHelperWithEnv } from "@/Core";
import { PrimaryContinuousQueryManagerWithEnvWithStateHelperWithEnv } from "@/Data/Managers/Helpers";

export class ServiceQueryManager extends PrimaryContinuousQueryManagerWithEnvWithStateHelperWithEnv<"GetService"> {
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
