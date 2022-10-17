import {
  Scheduler,
  ServiceInstanceParams,
  ApiHelper,
  StateHelperWithEnv,
} from "@/Core";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export function ServiceInstancesQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelperWithEnv<"GetServiceInstances">,
  scheduler: Scheduler
) {
  return QueryManager.ContinuousWithEnv<"GetServiceInstances">(
    apiHelper,
    stateHelper,
    scheduler,
    ({ kind, name }) => `${kind}_${name}`,
    ({ name, filter, sort, pageSize }) => [
      name,
      stringifyFilter(filter),
      sort?.name,
      sort?.order,
      pageSize.value,
    ],
    "GetServiceInstances",
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

function stringifyFilter(
  filter: ServiceInstanceParams.Filter | undefined
): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}

export function GetServiceInstancesOneTimeQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelperWithEnv<"GetServiceInstances">
) {
  return QueryManager.OneTimeWithEnv<"GetServiceInstances">(
    apiHelper,
    stateHelper,
    ({ name, filter, sort, pageSize }) => [
      name,
      stringifyFilter(filter),
      sort?.name,
      sort?.order,
      pageSize.value,
    ],
    "GetServiceInstances",
    (query) => getUrl(query, false),
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
    "MERGE"
  );
}
