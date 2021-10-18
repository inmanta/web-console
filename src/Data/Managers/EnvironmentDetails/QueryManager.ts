import { Fetcher, StateHelper, Scheduler } from "@/Core";
import { ContinuousQueryManagerImpl } from "@/Data/Common";
import { identity } from "lodash";

export class EnvironmentDetailsQueryManager extends ContinuousQueryManagerImpl<"EnvironmentDetails"> {
  constructor(
    fetcher: Fetcher<"EnvironmentDetails">,
    stateHelper: StateHelper<"EnvironmentDetails">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      () => `env-${environment}`,
      () => [environment],
      "EnvironmentDetails",
      () => `/api/v2/environment/${environment}`,
      identity,
      ""
    );
  }
}
