import { identity } from "lodash";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManagerWithEnv } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

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
      ({ kind }, environment) => `${kind}_${environment}`,
      (query, environment) => [environment],
      "GetEnvironmentDetails",
      ({ details }, environment) => getUrl(details, environment),
      identity
    );
  }
}
