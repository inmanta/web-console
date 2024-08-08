import { Scheduler, ApiHelper, stringifyObjectOrUndefined } from "@/Core";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export function GetFactsQueryManager(
  store: Store,
  apiHelper: ApiHelper,
  scheduler: Scheduler,
) {
  return QueryManager.ContinuousWithEnv<"GetFacts">(
    apiHelper,
    StateHelper(store),
    scheduler,
    ({ kind }, environment) => `${kind}_${environment}`,
    ({ filter, sort, pageSize, currentPage }, environment) => [
      environment,
      pageSize.value,
      sort?.name,
      sort?.order,
      stringifyObjectOrUndefined(filter),
      stringifyObjectOrUndefined(currentPage.value),
    ],
    "GetFacts",
    getUrl,
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
