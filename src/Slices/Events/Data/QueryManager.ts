import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { Filter } from "@S/Events/Core/Query";
import { getUrl } from "./getUrl";

export function EventsQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelper<"GetInstanceEvents">,
  scheduler: Scheduler
) {
  return QueryManager.ContinuousWithEnv<"GetInstanceEvents">(
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

function stringifyFilter(filter: Filter | undefined): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
