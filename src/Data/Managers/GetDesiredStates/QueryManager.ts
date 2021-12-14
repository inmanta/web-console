import { Scheduler, StateHelper, ApiHelper, DesiredStateParams } from "@/Core";
import {
  getPaginationHandlers,
  PrimaryContinuousQueryManagerWithEnv,
} from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class GetDesiredStatesQueryManager extends PrimaryContinuousQueryManagerWithEnv<"GetDesiredStates"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetDesiredStates">,
    scheduler: Scheduler
  ) {
    super(
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
}

function stringifyFilter(
  filter: DesiredStateParams.Filter | undefined
): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
