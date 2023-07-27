import { identity } from "lodash";
import { Scheduler, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export function GetDryRunsQueryManager(
  apiHelper: ApiHelper,
  store: Store,
  scheduler: Scheduler,
) {
  return QueryManager.ContinuousWithEnv<"GetDryRuns">(
    apiHelper,
    StateHelper(store),
    scheduler,
    ({ kind }, environment) => `${kind}_${environment}`,
    ({ version }, environment) => [environment, version],
    "GetDryRuns",
    getUrl,
    identity,
  );
}
