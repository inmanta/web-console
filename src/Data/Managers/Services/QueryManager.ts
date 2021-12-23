import { identity } from "lodash";
import { Scheduler, ApiHelper, StateHelperWithEnv } from "@/Core";
import { PrimaryContinuousQueryManagerWithEnvWithStateHelperWithEnv } from "@/Data/Managers/Helpers";

export class ServicesQueryManager extends PrimaryContinuousQueryManagerWithEnvWithStateHelperWithEnv<"GetServices"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelperWithEnv<"GetServices">,
    scheduler: Scheduler
  ) {
    super(
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
}
