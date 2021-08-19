import { Scheduler, Fetcher, StateHelper } from "@/Core";
import { ContinuousQueryManagerImpl } from "@/Data/Common";
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
