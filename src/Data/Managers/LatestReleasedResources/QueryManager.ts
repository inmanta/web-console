import { Scheduler, Fetcher, StateHelper } from "@/Core";
import { ContinuousQueryManagerImpl } from "@/Data/Common";
import { identity } from "lodash";

export class LatestReleasedResourcesQueryManager extends ContinuousQueryManagerImpl<"LatestReleasedResources"> {
  constructor(
    fetcher: Fetcher<"LatestReleasedResources">,
    stateHelper: StateHelper<"LatestReleasedResources">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      () => environment,
      () => [environment],
      "LatestReleasedResources",
      () => `/api/v2/resource`,
      identity,
      environment
    );
  }
}
