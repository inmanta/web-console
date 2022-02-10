import { identity } from "lodash-es";
import { Scheduler, ApiHelper, StateHelperWithEnv } from "@/Core";
import { PrimaryContinuousQueryManagerWithEnv } from "@/Data/Managers/Helpers";

export class ServicesQueryManager extends PrimaryContinuousQueryManagerWithEnv<"GetServices"> {
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
