import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManager } from "@/Data/Common";
import { identity } from "lodash";

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
