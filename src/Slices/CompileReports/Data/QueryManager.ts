import { Scheduler, ApiHelper, StateHelperWithEnv } from "@/Core";
import { getPaginationHandlers, QueryManager } from "@/Data/Managers/Helpers";
import { Filter } from "@S/CompileReports/Core/Query";
import { getUrl } from "./getUrl";

export class CompileReportsQueryManager extends QueryManager.ContinuousWithEnv<"GetCompileReports"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelperWithEnv<"GetCompileReports">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ kind }, environment) => `${kind}_${environment}`,
      ({ pageSize, sort, filter }, environment) => [
        environment,
        pageSize.value,
        sort?.name,
        sort?.order,
        stringifyFilter(filter),
      ],
      "GetCompileReports",
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

function stringifyFilter(filter: Filter | undefined): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
