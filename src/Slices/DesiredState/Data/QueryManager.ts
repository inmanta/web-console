import {
  Scheduler,
  ApiHelper,
  StateHelperWithEnv,
  stringifyObjectOrUndefined,
} from "@/Core";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { Filter } from "@S/DesiredState/Core/Query";
import { getUrl } from "./getUrl";

export function GetDesiredStatesQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelperWithEnv<"GetDesiredStates">,
  scheduler: Scheduler,
) {
  return QueryManager.ContinuousWithEnv<"GetDesiredStates">(
    apiHelper,
    stateHelper,
    scheduler,
    ({ kind }, environment) => `${kind}_${environment}`,
    ({ pageSize, filter, currentPage }, environment) => [
      environment,
      pageSize.value,
      stringifyFilter(filter),
      stringifyObjectOrUndefined(currentPage.value),
    ],
    "GetDesiredStates",
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

function stringifyFilter(filter: Filter | undefined): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
