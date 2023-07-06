import { identity } from "lodash-es";
import { StateHelper, ApiHelper, Scheduler } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "@S/Settings/Data/GetProjects/getUrl";

export function GetEnvironmentsQueryManager(
  apiHelper: ApiHelper,
  scheduler: Scheduler,
  stateHelper: StateHelper<"GetEnvironments">
) {
  return QueryManager.Continuous<"GetEnvironments">(
    apiHelper,
    stateHelper,
    scheduler,
    ({ kind }) => `${kind}`,
    () => [],
    "GetEnvironments",
    ({ details }) => getUrl(details),
    identity
  );
}
