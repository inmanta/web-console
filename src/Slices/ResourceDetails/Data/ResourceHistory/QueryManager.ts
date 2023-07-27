import { Scheduler, StateHelper, ApiHelper } from "@/Core";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export function ResourceHistoryQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelper<"GetResourceHistory">,
  scheduler: Scheduler,
) {
  return QueryManager.ContinuousWithEnv<"GetResourceHistory">(
    apiHelper,
    stateHelper,
    scheduler,
    ({ kind, id }) => `${kind}_${id}`,
    ({ sort, pageSize }, environment) => [
      environment,
      pageSize.value,
      sort?.name,
      sort?.order,
    ],
    "GetResourceHistory",
    getUrl,
    ({ data, links, metadata }, setUrl) => {
      if (typeof links === "undefined")
        return { data: data, handlers: {}, metadata };
      return {
        data: data,
        handlers: getPaginationHandlers(links, metadata, setUrl),
        metadata,
      };
    },
  );
}
