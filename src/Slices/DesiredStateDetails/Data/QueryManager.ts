import {
  Scheduler,
  ApiHelper,
  stringifyObjectOrUndefined,
  StateHelperWithEnv,
} from "@/Core";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export function GetVersionResourcesQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelperWithEnv<"GetVersionResources">,
  scheduler: Scheduler,
) {
  return QueryManager.ContinuousWithEnv<"GetVersionResources">(
    apiHelper,
    stateHelper,
    scheduler,
    ({ kind, version }) => `${kind}_${version}`,
    ({ pageSize, filter, sort, currentPage }, environment) => [
      environment,
      pageSize.value,
      stringifyObjectOrUndefined(filter),
      sort?.name,
      sort?.order,
      stringifyObjectOrUndefined(currentPage.value),
    ],
    "GetVersionResources",
    getUrl,
    ({ data, links, metadata }) => {
      if (typeof links === "undefined") return { data, handlers: {}, metadata };
      return {
        data,
        handlers: getPaginationHandlers(links, metadata),
        metadata,
      };
    },
  );
}
