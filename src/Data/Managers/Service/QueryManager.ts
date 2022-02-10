import { identity } from "lodash-es";
import { KeyMaker, Scheduler, ApiHelper, StateHelperWithEnv } from "@/Core";
import { PrimaryContinuousQueryManagerWithEnv } from "@/Data/Managers/Helpers";

export class ServiceQueryManager extends PrimaryContinuousQueryManagerWithEnv<"GetService"> {
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
