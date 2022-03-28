import { identity } from "lodash-es";
import { ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export class GetProjectsQueryManager extends QueryManager.OneTime<"GetProjects"> {
  constructor(store: Store, apiHelper: ApiHelper) {
    super(
      apiHelper,
      new StateHelper(store),
      () => [],
      "GetProjects",
      ({ environmentDetails }) => getUrl(environmentDetails),
      identity,
      "MERGE"
    );
  }
}
