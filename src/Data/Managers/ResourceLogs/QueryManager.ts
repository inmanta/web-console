import { Scheduler, Fetcher, StateHelper } from "@/Core";
import {
  ContinuousQueryManagerImpl,
  getPaginationHandlers,
} from "@/Data/Common";
import { getUrl } from "./getUrl";

export class ResourceLogsQueryManager extends ContinuousQueryManagerImpl<"ResourceLogs"> {
  constructor(
    fetcher: Fetcher<"ResourceLogs">,
    stateHelper: StateHelper<"ResourceLogs">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      () => environment,
      ({ pageSize }) => [environment, pageSize.value],
      "ResourceLogs",
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
