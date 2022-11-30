import { identity } from "lodash";
import { ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export function GetDryRunReportQueryManager(
  apiHelper: ApiHelper,
  store: Store
) {
  return QueryManager.OneTimeWithEnv<"GetDryRunReport">(
    apiHelper,
    StateHelper(store),
    ({ reportId }, environment) => [environment, reportId],
    "GetDryRunReport",
    getUrl,
    identity
  );
}
