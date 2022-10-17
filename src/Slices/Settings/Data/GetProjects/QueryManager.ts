import { identity } from "lodash-es";
import { ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export function GetProjectsQueryManager(store: Store, apiHelper: ApiHelper) {
  return QueryManager.OneTime<"GetProjects">(
    apiHelper,
    StateHelper(store),
    () => [],
    "GetProjects",
    ({ environmentDetails }) => getUrl(environmentDetails),
    identity,
    "MERGE"
  );
}
