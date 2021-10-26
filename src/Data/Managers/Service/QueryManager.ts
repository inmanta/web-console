import { KeyMaker, Fetcher, StateHelper, Scheduler } from "@/Core";
import { ContinuousQueryManagerImpl } from "@/Data/Common";
import { identity } from "lodash";

export class ServiceQueryManager extends ContinuousQueryManagerImpl<"GetService"> {
  constructor(
    fetcher: Fetcher<"GetService">,
    stateHelper: StateHelper<"GetService">,
    scheduler: Scheduler,
    keyMaker: KeyMaker<[string, string]>,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      ({ name }) => keyMaker.make([environment, name]),
      ({ name }) => [name, environment],
      "GetService",
      ({ name }) => `/lsm/v1/service_catalog/${name}?instance_summary=True`,
      identity,
      environment
    );
  }
}
