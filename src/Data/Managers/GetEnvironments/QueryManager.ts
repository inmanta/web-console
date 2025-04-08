import { identity } from "lodash-es";
import { StateHelper, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "@S/Settings/Data/GetProjects/getUrl";

export function GetEnvironmentsQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelper<"GetEnvironments">
) {
  return QueryManager.OneTime<"GetEnvironments">(
    apiHelper,
    stateHelper,
    () => [],
    "GetEnvironments",
    ({ details }) => getUrl(details),
    identity,
    "MERGE"
  );
}
