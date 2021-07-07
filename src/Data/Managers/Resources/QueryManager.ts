import { Scheduler, Fetcher, StateHelper, ResourceParams } from "@/Core";
import { ContinuousQueryManagerImpl } from "@/Data/Common";
import { getUrl } from "./getUrl";

export class ResourcesQueryManager extends ContinuousQueryManagerImpl<"Resources"> {
  constructor(
    fetcher: Fetcher<"Resources">,
    stateHelper: StateHelper<"Resources">,
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
        pageSize,
        sort?.name,
        sort?.order,
        stringifyFilter(filter),
      ],
      "Resources",
      getUrl,
      ({ data, links, metadata }, setUrl) => {
        if (typeof links === "undefined")
          return { data: data, handlers: {}, metadata };
        const { prev, next } = links;
        const prevCb = prev ? () => setUrl(prev) : undefined;
        const nextCb = next ? () => setUrl(next) : undefined;
        return {
          data: data,
          handlers: { prev: prevCb, next: nextCb },
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
