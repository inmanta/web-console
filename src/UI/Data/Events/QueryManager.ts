import { Fetcher, StateHelper, Scheduler, EventParams } from "@/Core";
import { ContinuousQueryManagerImpl } from "@/UI/Data/QueryManagerImpl";
import { getUrl } from "./getUrl";

export class EventsQueryManager extends ContinuousQueryManagerImpl<"Events"> {
  constructor(
    fetcher: Fetcher<"Events">,
    stateHelper: StateHelper<"Events">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      ({ qualifier }) => qualifier.id,
      ({ qualifier }) => [
        qualifier.id,
        qualifier.service_entity,
        qualifier.sort?.order,
        stringifyFilter(qualifier.filter),
        qualifier.pageSize,
      ],
      "Events",
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

function stringifyFilter(filter: EventParams.Filter | undefined): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
