import { Fetcher, StateHelper, Scheduler } from "@/Core";
import { identity } from "lodash";
import { ContinuousQueryManagerImpl } from "@/Data/Common";

export class ResourceDetailsQueryManager extends ContinuousQueryManagerImpl<"ResourceDetails"> {
  constructor(
    fetcher: Fetcher<"ResourceDetails">,
    stateHelper: StateHelper<"ResourceDetails">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      ({ id }) => id,
      ({ id }) => [id],
      "ResourceDetails",
      ({ id }) => `/api/v2/resource/${encodeURIComponent(id)}`,
      identity,
      environment
    );
  }
}
