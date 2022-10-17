import { identity } from "lodash-es";
import { StateHelper, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";

export function GetServerStatusOneTimeQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelper<"GetServerStatus">
) {
  return QueryManager.OneTime<"GetServerStatus">(
    apiHelper,
    stateHelper,
    () => [],
    "GetServerStatus",
    () => `/api/v1/serverstatus`,
    identity,
    "MERGE"
  );
}
