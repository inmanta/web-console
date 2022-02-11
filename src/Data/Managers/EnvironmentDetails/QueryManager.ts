import { identity } from "lodash-es";
import { Scheduler, ApiHelper, StateHelperWithEnv } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class EnvironmentDetailsQueryManager extends QueryManager.ContinuousWithEnv<"GetEnvironmentDetails"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelperWithEnv<"GetEnvironmentDetails">,
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
