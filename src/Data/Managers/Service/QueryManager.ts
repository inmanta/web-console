import { KeyMaker, StateHelper, Scheduler, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManager } from "@/Data/Common";
import { identity } from "lodash";

export class ServiceQueryManager extends PrimaryContinuousQueryManager<"GetService"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetService">,
    scheduler: Scheduler,
    keyMaker: KeyMaker<[string, string]>,
    environment: string
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ name }) => keyMaker.make([environment, name]),
      ({ name }) => [name, environment],
      "GetService",
      ({ name }) => `/lsm/v1/service_catalog/${name}?instance_summary=True`,
      identity,
      environment
    );
  }
}
