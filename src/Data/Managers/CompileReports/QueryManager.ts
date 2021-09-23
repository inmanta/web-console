import { Scheduler, Fetcher, StateHelper } from "@/Core";
import {
  ContinuousQueryManagerImpl,
  getPaginationHandlers,
} from "@/Data/Common";
import { getUrl } from "./getUrl";

export class CompileReportsQueryManager extends ContinuousQueryManagerImpl<"CompileReports"> {
  constructor(
    fetcher: Fetcher<"CompileReports">,
    stateHelper: StateHelper<"CompileReports">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      () => environment,
      ({ pageSize, sort }) => [
        environment,
        pageSize.value,
        sort?.name,
        sort?.order,
      ],
      "CompileReports",
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
