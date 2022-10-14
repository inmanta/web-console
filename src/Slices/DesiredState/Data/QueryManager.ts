import { Scheduler, ApiHelper, StateHelperWithEnv } from "@/Core";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { Filter } from "@S/DesiredState/Core/Query";
import { getUrl } from "./getUrl";

export function GetDesiredStatesQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelperWithEnv<"GetDesiredStates">,
  scheduler: Scheduler
) {
  return QueryManager.ContinuousWithEnv<"GetDesiredStates">(
    apiHelper,
    stateHelper,
    scheduler,
    ({ kind }, environment) => `${kind}_${environment}`,
    ({ pageSize, filter }, environment) => [
      environment,
      pageSize.value,
      stringifyFilter(filter),
    ],
    "GetDesiredStates",
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

function stringifyFilter(filter: Filter | undefined): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
