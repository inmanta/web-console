import {
  Scheduler,
  ApiHelper,
  StateHelperWithEnv,
  stringifyObjectOrUndefined,
} from "@/Core";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export function GetDiscoveredResourcesQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelperWithEnv<"GetDiscoveredResources">,
  scheduler: Scheduler,
) {
  return QueryManager.ContinuousWithEnv<"GetDiscoveredResources">(
    apiHelper,
    stateHelper,
    scheduler,
    ({ kind }, environment) => `${kind}_${environment}`,
    ({ pageSize, filter, sort, currentPage }, environment) => [
      environment,
      pageSize.value,
      sort?.name,
      sort?.order,
      stringifyObjectOrUndefined(filter),
      stringifyObjectOrUndefined(currentPage.value),
    ],
    "GetDiscoveredResources",
    (query) => getUrl(query),
    ({ data, links, metadata }) => {
      if (typeof links === "undefined") {
        return { data: data, handlers: {}, metadata };
      }
      return {
        data: data,
        handlers: getPaginationHandlers(links, metadata),
        metadata,
      };
    },
  );
}
