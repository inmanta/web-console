import { identity } from "lodash-es";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export function ResourceDetailsQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelper<"GetResourceDetails">,
  scheduler: Scheduler,
) {
  return QueryManager.ContinuousWithEnv<"GetResourceDetails">(
    apiHelper,
    stateHelper,
    scheduler,
    ({ kind, id }) => `${kind}_${id}`,
    ({ id }) => [id],
    "GetResourceDetails",
    getUrl,
    identity,
  );
}
