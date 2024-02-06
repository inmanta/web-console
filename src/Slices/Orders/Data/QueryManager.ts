import {
  Scheduler,
  ApiHelper,
  StateHelperWithEnv,
  stringifyObjectOrUndefined,
} from "@/Core";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export function GetOrdersQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelperWithEnv<"GetOrders">,
  scheduler: Scheduler,
) {
  return QueryManager.ContinuousWithEnv<"GetOrders">(
    apiHelper,
    stateHelper,
    scheduler,
    ({ kind }, environment) => `${kind}_${environment}`,
    ({ pageSize, sort, currentPage }, environment) => [
      environment,
      pageSize.value,
      sort?.name,
      sort?.order,
      stringifyObjectOrUndefined(currentPage.value),
    ],
    "GetOrders",
    (query) => getUrl(query),
    ({ data, links, metadata }) => {
      if (typeof links === "undefined") {
        return { data: data, handlers: {}, metadata };
      }
      return {
        data: data,
        handlers: getPaginationHandlers(links, metadata),
        metadata,
      };
    },
  );
}
