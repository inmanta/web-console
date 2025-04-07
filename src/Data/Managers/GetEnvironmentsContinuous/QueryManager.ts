import { identity } from "lodash-es";
import { StateHelper, ApiHelper, Scheduler } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "@S/Settings/Data/GetProjects/getUrl";

export function GetEnvironmentsContinuousQueryManager(
  apiHelper: ApiHelper,
  scheduler: Scheduler,
  stateHelper: StateHelper<"GetEnvironmentsContinuous">,
) {
  return QueryManager.Continuous<"GetEnvironmentsContinuous">(
    apiHelper,
    stateHelper,
    scheduler,
    ({ kind }) => `${kind}`,
    () => [],
    "GetEnvironmentsContinuous",
    ({ details }) => getUrl(details),
    identity,
  );
}
