import { Scheduler, Fetcher, StateHelper } from "@/Core";
import { ContinuousQueryManagerImpl } from "@/Data/Common";
import { getUrl } from "./getUrl";

export class ResourceActionsQueryManager extends ContinuousQueryManagerImpl<"ResourceActions"> {
  constructor(
    fetcher: Fetcher<"ResourceActions">,
    stateHelper: StateHelper<"ResourceActions">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      () => environment,
      () => [environment],
      "ResourceActions",
      getUrl,
      ({ data }) => ({ data }),
      environment
    );
  }
}
