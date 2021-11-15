import { identity } from "lodash";
import { KeyMaker, StateHelper, Scheduler, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManagerWithEnv } from "@/Data/Managers/Helpers";

export class ServiceQueryManager extends PrimaryContinuousQueryManagerWithEnv<"GetService"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetService">,
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
