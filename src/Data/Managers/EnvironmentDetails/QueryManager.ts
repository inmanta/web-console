import { identity } from "lodash";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManagerWithEnv } from "@/Data/Managers/Helpers";

export class EnvironmentDetailsQueryManager extends PrimaryContinuousQueryManagerWithEnv<"GetEnvironmentDetails"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetEnvironmentDetails">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      (query, environment) => `env-${environment}`,
      (query, environment) => [environment],
      "GetEnvironmentDetails",
      (query, environment) => `/api/v2/environment/${environment}`,
      identity
    );
  }
}
