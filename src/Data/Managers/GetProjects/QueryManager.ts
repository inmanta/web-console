import { identity } from "lodash";
import { StateHelper, ApiHelper } from "@/Core";
import { PrimaryOneTimeQueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class GetProjectsQueryManager extends PrimaryOneTimeQueryManager<"GetProjects"> {
  constructor(apiHelper: ApiHelper, stateHelper: StateHelper<"GetProjects">) {
    super(
      apiHelper,
      stateHelper,
      () => [],
      "GetProjects",
      ({ environmentDetails }) => getUrl(environmentDetails),
      identity
    );
  }
}
