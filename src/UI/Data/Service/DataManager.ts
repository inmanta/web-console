import { KeyMaker, Query, Fetcher, StateHelper, Scheduler } from "@/Core";
import { ContinuousDataManagerImpl } from "../DataManagerImpl";
import { identity } from "lodash";

export class ServiceDataManager extends ContinuousDataManagerImpl<"Service"> {
  constructor(
    fetcher: Fetcher<"Service">,
    stateHelper: StateHelper<"Service">,
    scheduler: Scheduler,
    keyMaker: KeyMaker<Query.Qualifier<"Service">>,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      (qualifier) => keyMaker.make(qualifier),
      (qualifier) => [qualifier.name, qualifier.environment],
      "Service",
      ({ name }) => `/lsm/v1/service_catalog/${name}`,
      identity,
      environment
    );
  }
}
