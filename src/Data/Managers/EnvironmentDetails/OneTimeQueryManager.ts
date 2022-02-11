import { identity } from "lodash-es";
import { ApiHelper, StateHelperWithEnv } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class EnvironmentDetailsOneTimeQueryManager extends QueryManager.OneTimeWithEnv<"GetEnvironmentDetails"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelperWithEnv<"GetEnvironmentDetails">
  ) {
    super(
      apiHelper,
      stateHelper,
      (query, environment) => [environment],
      "GetEnvironmentDetails",
      ({ details }, environment) => getUrl(details, environment),
      identity
    );
  }
}
