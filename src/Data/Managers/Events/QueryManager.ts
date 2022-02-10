import { StateHelper, Scheduler, EventParams, ApiHelper } from "@/Core";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class EventsQueryManager extends QueryManager.ContinuousWithEnv<"GetInstanceEvents"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetInstanceEvents">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ kind, id }) => `${kind}_${id}`,
      ({ id, service_entity, sort, filter, pageSize }) => [
        id,
        service_entity,
        sort?.order,
        stringifyFilter(filter),
        pageSize.value,
      ],
      "GetInstanceEvents",
      (query) => getUrl(query),
      ({ data, links, metadata }, setUrl) => {
        if (typeof links === "undefined") {
          return { data: data, handlers: {}, metadata };
        }
        return {
          data: data,
          handlers: getPaginationHandlers(links, metadata, setUrl),
          metadata,
        };
      }
    );
  }
}

function stringifyFilter(filter: EventParams.Filter | undefined): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
