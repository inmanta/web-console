import { Scheduler, ApiHelper, stringifyObjectOrUndefined } from "@/Core";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { Filter } from "@S/CompileReports/Core/Query";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export function CompileReportsQueryManager(
  store: Store,
  apiHelper: ApiHelper,
  scheduler: Scheduler,
) {
  return QueryManager.ContinuousWithEnv<"GetCompileReports">(
    apiHelper,
    StateHelper(store),
    scheduler,
    ({ kind }, environment) => `${kind}_${environment}`,
    ({ pageSize, sort, filter, currentPage }, environment) => [
      environment,
      pageSize.value,
      sort?.name,
      sort?.order,
      stringifyFilter(filter),
      stringifyObjectOrUndefined(currentPage.value),
    ],
    "GetCompileReports",
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

function stringifyFilter(filter: Filter | undefined): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
