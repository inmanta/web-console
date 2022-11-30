import { identity } from "lodash-es";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";

export function GetResourceFactsQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelper<"GetResourceFacts">,
  scheduler: Scheduler
) {
  return QueryManager.ContinuousWithEnv<"GetResourceFacts">(
    apiHelper,
    stateHelper,
    scheduler,
    ({ kind, resourceId }) => `${kind}_${resourceId}`,
    ({ resourceId }) => [resourceId],
    "GetResourceFacts",
    ({ resourceId }) => `/api/v2/resource/${resourceId}/facts`,
    identity
  );
}
