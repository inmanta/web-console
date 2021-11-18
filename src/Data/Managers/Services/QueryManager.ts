import { identity } from "lodash";
import { Scheduler, StateHelper, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManagerWithEnv } from "@/Data/Managers/Helpers";

export class ServicesQueryManager extends PrimaryContinuousQueryManagerWithEnv<"GetServices"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetServices">,
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
