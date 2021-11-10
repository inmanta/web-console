import { identity } from "lodash";
import { Scheduler, StateHelper, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManager } from "@/Data/Managers/Helpers";

export class ServicesQueryManager extends PrimaryContinuousQueryManager<"GetServices"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetServices">,
    scheduler: Scheduler,
    useEnvironment: () => string
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ kind }) => kind,
      () => [],
      "GetServices",
      () => `/lsm/v1/service_catalog?instance_summary=True`,
      identity,
      useEnvironment
    );
  }
}
