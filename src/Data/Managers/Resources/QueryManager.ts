import { Scheduler, Fetcher, StateHelper, ResourceParams } from "@/Core";
import {
  ContinuousQueryManagerImpl,
  getPaginationHandlers,
} from "@/Data/Common";
import { getUrl } from "./getUrl";

export class ResourcesQueryManager extends ContinuousQueryManagerImpl<"GetResources"> {
  constructor(
    fetcher: Fetcher<"GetResources">,
    stateHelper: StateHelper<"GetResources">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      () => environment,
      ({ filter, sort, pageSize }) => [
        environment,
        pageSize.value,
        sort?.name,
        sort?.order,
        stringifyFilter(filter),
      ],
      "GetResources",
      getUrl,
      ({ data, links, metadata }, setUrl) => {
        if (typeof links === "undefined") {
          return { data: data, handlers: {}, metadata };
        }
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

function stringifyFilter(filter: ResourceParams.Filter | undefined): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
