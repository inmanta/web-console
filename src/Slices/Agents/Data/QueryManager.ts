import { Scheduler, ApiHelper, stringifyObjectOrUndefined } from "@/Core";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export function GetAgentsQueryManager(
  store: Store,
  apiHelper: ApiHelper,
  scheduler: Scheduler
) {
  return QueryManager.ContinuousWithEnv<"GetAgents">(
    apiHelper,
    StateHelper(store),
    scheduler,
    ({ kind }, environment) => `${kind}_${environment}`,
    ({ pageSize, sort, filter }, environment) => [
      environment,
      pageSize.value,
      sort?.name,
      sort?.order,
      stringifyObjectOrUndefined(filter),
    ],
    "GetAgents",
    (query) => getUrl(query),
    ({ data, links, metadata }, setUrl) => {
      if (typeof links === "undefined") {
        return { data: data, handlers: {}, metadata };
      }
      return {
        data: data,
        handlers: getPaginationHandlers(links, metadata, setUrl),
        metadata,
      };
    }
  );
}
