import { identity } from "lodash-es";
import { StateHelper, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class GetProjectsQueryManager extends QueryManager.OneTime<"GetProjects"> {
  constructor(apiHelper: ApiHelper, stateHelper: StateHelper<"GetProjects">) {
    super(
      apiHelper,
      stateHelper,
      () => [],
      "GetProjects",
      ({ environmentDetails }) => getUrl(environmentDetails),
      identity,
      "MERGE"
    );
  }
}
