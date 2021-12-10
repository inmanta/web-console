import { identity } from "lodash";
import { StateHelper, ApiHelper } from "@/Core";
import { PrimaryOneTimeQueryManagerWithEnv } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class EnvironmentDetailsOneTimeQueryManager extends PrimaryOneTimeQueryManagerWithEnv<"GetEnvironmentDetails"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetEnvironmentDetails">
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
