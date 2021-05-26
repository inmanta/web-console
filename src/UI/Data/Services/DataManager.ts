import { Scheduler, Fetcher, StateHelper } from "@/Core";
import { ContinuousDataManagerImpl } from "../DataManagerImpl";
import { identity } from "lodash";

export class ServicesDataManager extends ContinuousDataManagerImpl<"Services"> {
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
