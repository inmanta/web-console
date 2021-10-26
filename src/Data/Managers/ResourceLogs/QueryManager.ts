import { Scheduler, Fetcher, StateHelper, ResourceLogFilter } from "@/Core";
import {
  ContinuousQueryManagerImpl,
  getPaginationHandlers,
} from "@/Data/Common";
import { getUrl } from "./getUrl";

export class ResourceLogsQueryManager extends ContinuousQueryManagerImpl<"GetResourceLogs"> {
  constructor(
    fetcher: Fetcher<"GetResourceLogs">,
    stateHelper: StateHelper<"GetResourceLogs">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
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
