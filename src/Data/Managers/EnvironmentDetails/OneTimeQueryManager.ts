import { identity } from "lodash-es";
import { ApiHelper, StateHelperWithEnv } from "@/Core";
import { PrimaryOneTimeQueryManagerWithEnvWithStateHelperWithEnv } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class EnvironmentDetailsOneTimeQueryManager extends PrimaryOneTimeQueryManagerWithEnvWithStateHelperWithEnv<"GetEnvironmentDetails"> {
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
