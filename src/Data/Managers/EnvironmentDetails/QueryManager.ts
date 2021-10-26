import { Fetcher, StateHelper, Scheduler } from "@/Core";
import { ContinuousQueryManagerImpl } from "@/Data/Common";
import { identity } from "lodash";

export class EnvironmentDetailsQueryManager extends ContinuousQueryManagerImpl<"GetEnvironmentDetails"> {
  constructor(
    fetcher: Fetcher<"GetEnvironmentDetails">,
    stateHelper: StateHelper<"GetEnvironmentDetails">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      () => `env-${environment}`,
      () => [environment],
      "GetEnvironmentDetails",
      () => `/api/v2/environment/${environment}`,
      identity,
      ""
    );
  }
}
