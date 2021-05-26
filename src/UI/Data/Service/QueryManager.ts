import { KeyMaker, Fetcher, StateHelper, Scheduler } from "@/Core";
import { ContinuousQueryManagerImpl } from "@/UI/Data/QueryManagerImpl";
import { identity } from "lodash";

export class ServiceQueryManager extends ContinuousQueryManagerImpl<"Service"> {
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
