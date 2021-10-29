import { Scheduler, StateHelper, CompileReportParams, ApiHelper } from "@/Core";
import {
  getPaginationHandlers,
  PrimaryContinuousQueryManager,
} from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class CompileReportsQueryManager extends PrimaryContinuousQueryManager<"GetCompileReports"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetCompileReports">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      () => environment,
      ({ pageSize, sort, filter }) => [
        environment,
        pageSize.value,
        sort?.name,
        sort?.order,
        stringifyFilter(filter),
      ],
      "GetCompileReports",
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

function stringifyFilter(
  filter: CompileReportParams.Filter | undefined
): string {
  return typeof filter === "undefined" ? "undefined" : JSON.stringify(filter);
}
