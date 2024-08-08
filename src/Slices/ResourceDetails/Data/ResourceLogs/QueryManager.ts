import {
  Scheduler,
  StateHelper,
  ApiHelper,
  stringifyObjectOrUndefined,
} from "@/Core";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { ResourceLogFilter } from "@S/ResourceDetails/Core/ResourceLog";
import { getUrl } from "./getUrl";

export function ResourceLogsQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelper<"GetResourceLogs">,
  scheduler: Scheduler,
) {
  return QueryManager.ContinuousWithEnv<"GetResourceLogs">(
    apiHelper,
    stateHelper,
    scheduler,
    ({ kind, id }) => `${kind}_${id}`,
    ({ pageSize, filter, sort, currentPage }, environment) => [
      environment,
      pageSize.value,
      stringifyFilter(filter),
      sort?.name,
      sort?.order,
      stringifyObjectOrUndefined(currentPage.value),
    ],
    "GetResourceLogs",
    getUrl,
    ({ data, links, metadata }) => {
      if (typeof links === "undefined")
        return { data: data, handlers: {}, metadata };
      return {
        data: data,
        handlers: getPaginationHandlers(links, metadata),
        metadata,
      };
    },
  );
}

function stringifyFilter(filter: ResourceLogFilter | undefined): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
