import { Scheduler, StateHelper, ResourceLogFilter, ApiHelper } from "@/Core";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class ResourceLogsQueryManager extends QueryManager.ContinuousWithEnv<"GetResourceLogs"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetResourceLogs">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ kind, id }) => `${kind}_${id}`,
      ({ pageSize, filter, sort }, environment) => [
        environment,
        pageSize.value,
        stringifyFilter(filter),
        sort?.name,
        sort?.order,
      ],
      "GetResourceLogs",
      getUrl,
      ({ data, links, metadata }, setUrl) => {
        if (typeof links === "undefined")
          return { data: data, handlers: {}, metadata };
        return {
          data: data,
          handlers: getPaginationHandlers(links, metadata, setUrl),
          metadata,
        };
      }
    );
  }
}

function stringifyFilter(filter: ResourceLogFilter | undefined): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
