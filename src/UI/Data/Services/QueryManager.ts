import { Scheduler, Fetcher, StateHelper } from "@/Core";
import { ContinuousQueryManagerImpl } from "@/UI/Data/QueryManagerImpl";
import { identity } from "lodash";

export class ServicesQueryManager extends ContinuousQueryManagerImpl<"Services"> {
  constructor(
    fetcher: Fetcher<"Services">,
    stateHelper: StateHelper<"Services">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      () => environment,
      () => [environment],
      "Services",
      () => `/lsm/v1/service_catalog?instance_summary=True`,
      identity,
      environment
    );
  }
}
