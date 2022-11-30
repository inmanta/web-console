import { Scheduler, ApiHelper, stringifyObjectOrUndefined } from "@/Core";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export function NotificationContinuousQueryManager(
  apiHelper: ApiHelper,
  store: Store,
  scheduler: Scheduler
) {
  return QueryManager.ContinuousWithEnv<"GetNotifications">(
    apiHelper,
    StateHelper(store),
    scheduler,
    ({ kind, origin }, environment) => `${kind}_${environment}_${origin}`,
    ({ filter, pageSize }, environment) => [
      environment,
      pageSize.value,
      stringifyObjectOrUndefined(filter),
    ],
    "GetNotifications",
    getUrl,
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
