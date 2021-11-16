import { Scheduler, StateHelper, CompileReportParams, ApiHelper } from "@/Core";
import {
  getPaginationHandlers,
  PrimaryContinuousQueryManagerWithEnv,
} from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class CompileReportsQueryManager extends PrimaryContinuousQueryManagerWithEnv<"GetCompileReports"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetCompileReports">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      (query, environment) => environment,
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

function stringifyFilter(
  filter: CompileReportParams.Filter | undefined
): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
