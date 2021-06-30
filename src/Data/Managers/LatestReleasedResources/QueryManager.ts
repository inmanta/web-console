import { Scheduler, Fetcher, StateHelper } from "@/Core";
import { ContinuousQueryManagerImpl } from "@/Data/Common";
import { getUrl } from "./getUrl";

export class LatestReleasedResourcesQueryManager extends ContinuousQueryManagerImpl<"LatestReleasedResources"> {
  constructor(
    fetcher: Fetcher<"LatestReleasedResources">,
    stateHelper: StateHelper<"LatestReleasedResources">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      () => environment,
      ({ pageSize }) => [environment, pageSize],
      "LatestReleasedResources",
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
