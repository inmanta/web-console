import { Scheduler, Fetcher, StateHelper } from "@/Core";
import {
  ContinuousQueryManagerImpl,
  getPaginationHandlers,
} from "@/Data/Common";
import { getUrl } from "./getUrl";

export class ResourceHistoryQueryManager extends ContinuousQueryManagerImpl<"ResourceHistory"> {
  constructor(
    fetcher: Fetcher<"ResourceHistory">,
    stateHelper: StateHelper<"ResourceHistory">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      () => environment,
      ({ sort, pageSize }) => [
        environment,
        pageSize.value,
        sort?.name,
        sort?.order,
      ],
      "ResourceHistory",
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
