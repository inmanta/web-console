import { KeyMaker, Fetcher, StateHelper, Scheduler } from "@/Core";
import { ContinuousDataManagerImpl } from "../DataManagerImpl";
import { identity } from "lodash";

export class ServiceDataManager extends ContinuousDataManagerImpl<"Service"> {
  constructor(
    fetcher: Fetcher<"Service">,
    stateHelper: StateHelper<"Service">,
    scheduler: Scheduler,
    keyMaker: KeyMaker<[string, string]>,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      ({ name }) => keyMaker.make([environment, name]),
      (qualifier) => [qualifier.name, environment],
      "Service",
      ({ name }) => `/lsm/v1/service_catalog/${name}`,
      identity,
      environment
    );
  }
}
