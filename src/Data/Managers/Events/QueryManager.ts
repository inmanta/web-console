import { Fetcher, StateHelper, Scheduler, EventParams } from "@/Core";
import {
  ContinuousQueryManagerImpl,
  getPaginationHandlers,
} from "@/Data/Common";
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
      ({ id }) => id,
      ({ id, service_entity, sort, filter, pageSize }) => [
        id,
        service_entity,
        sort?.order,
        stringifyFilter(filter),
        pageSize,
      ],
      "Events",
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

function stringifyFilter(filter: EventParams.Filter | undefined): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
