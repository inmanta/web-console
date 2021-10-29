import { StateHelper, Scheduler, EventParams, ApiHelper } from "@/Core";
import {
  getPaginationHandlers,
  PrimaryContinuousQueryManager,
} from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class EventsQueryManager extends PrimaryContinuousQueryManager<"GetInstanceEvents"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetInstanceEvents">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ id }) => id,
      ({ id, service_entity, sort, filter, pageSize }) => [
        id,
        service_entity,
        sort?.order,
        stringifyFilter(filter),
        pageSize.value,
      ],
      "GetInstanceEvents",
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
