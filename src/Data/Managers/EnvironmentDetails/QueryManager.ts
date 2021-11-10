import { identity } from "lodash";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManager } from "@/Data/Managers/Helpers";

export class EnvironmentDetailsQueryManager extends PrimaryContinuousQueryManager<"GetEnvironmentDetails"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetEnvironmentDetails">,
    scheduler: Scheduler,
    useEnvironment: () => string
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      (query, environment) => `env-${environment}`,
      (query, environment) => [environment],
      "GetEnvironmentDetails",
      (query, environment) => `/api/v2/environment/${environment}`,
      identity,
      useEnvironment
    );
  }
}
