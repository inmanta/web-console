import { Scheduler, StateHelper, ResourceLogFilter, ApiHelper } from "@/Core";
import {
  getPaginationHandlers,
  PrimaryContinuousQueryManager,
} from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class ResourceLogsQueryManager extends PrimaryContinuousQueryManager<"GetResourceLogs"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetResourceLogs">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      () => environment,
      ({ pageSize, filter, sort }) => [
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
      },
      environment
    );
  }
}

function stringifyFilter(filter: ResourceLogFilter | undefined): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
