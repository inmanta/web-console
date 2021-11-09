import { identity } from "lodash";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManager } from "@/Data/Managers/Helpers";

export class EnvironmentDetailsQueryManager extends PrimaryContinuousQueryManager<"GetEnvironmentDetails"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetEnvironmentDetails">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      apiHelper,
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
