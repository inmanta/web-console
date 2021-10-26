import { Scheduler, Fetcher, StateHelper } from "@/Core";
import { ContinuousQueryManagerImpl } from "@/Data/Common";
import { identity } from "lodash";

export class ServicesQueryManager extends ContinuousQueryManagerImpl<"GetServices"> {
  constructor(
    fetcher: Fetcher<"GetServices">,
    stateHelper: StateHelper<"GetServices">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
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
