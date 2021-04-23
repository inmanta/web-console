import { Scheduler, Fetcher, StateHelper } from "@/Core";
import { ContinuousDataManagerImpl } from "../DataManagerImpl";
import { identity } from "lodash";

export class ServicesDataManager extends ContinuousDataManagerImpl<"Services"> {
  constructor(
    fetcher: Fetcher<"Services">,
    stateHelper: StateHelper<"Services">,
    scheduler: Scheduler
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      (qualifier) => qualifier.environment,
      (qualifier) => [qualifier.environment],
      "Services",
      () => `/lsm/v1/service_catalog`,
      identity
    );
  }
}
