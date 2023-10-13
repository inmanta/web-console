import { identity } from "lodash-es";
import { StateHelper, ApiHelper, Scheduler } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";

export function GetServerStatusContinuousQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelper<"GetServerStatus">,
  scheduler: Scheduler,
) {
  return QueryManager.Continuous<"GetServerStatus">(
    apiHelper,
    stateHelper,
    scheduler,
    ({ kind }) => kind,
    () => [],
    "GetServerStatus",
    () => `/api/v1/serverstatus`,
    identity,
  );
}
