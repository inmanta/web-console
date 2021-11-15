import { identity } from "lodash";
import { StateHelper, ApiHelper } from "@/Core";
import { PrimaryOneTimeQueryManagerWithEnv } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class GetProjectsQueryManager extends PrimaryOneTimeQueryManagerWithEnv<"GetProjects"> {
  constructor(apiHelper: ApiHelper, stateHelper: StateHelper<"GetProjects">) {
    super(
      apiHelper,
      stateHelper,
      (query, environment) => [environment],
      "GetProjects",
      getUrl,
      identity
    );
  }
}
