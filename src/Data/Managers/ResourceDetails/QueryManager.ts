import { Fetcher, StateHelper, Scheduler } from "@/Core";
import { identity } from "lodash";
import { ContinuousQueryManagerImpl } from "@/Data/Common";

export class ResourceDetailsQueryManager extends ContinuousQueryManagerImpl<"GetResourceDetails"> {
  constructor(
    fetcher: Fetcher<"GetResourceDetails">,
    stateHelper: StateHelper<"GetResourceDetails">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      ({ id }) => id,
      ({ id }) => [id],
      "GetResourceDetails",
      ({ id }) => `/api/v2/resource/${id}`,
      identity,
      environment
    );
  }
}
