import { Scheduler, StateHelper, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManager } from "@/Data/Common";
import { identity } from "lodash";

export class ServicesQueryManager extends PrimaryContinuousQueryManager<"GetServices"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetServices">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      () => environment,
      () => [environment],
      "GetServices",
      () => `/lsm/v1/service_catalog?instance_summary=True`,
      identity,
      environment
    );
  }
}
