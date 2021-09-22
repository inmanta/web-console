import { Scheduler, Fetcher, StateHelper } from "@/Core";
import {
  ContinuousQueryManagerImpl,
  getPaginationHandlers,
} from "@/Data/Common";

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
      () => [environment],
      "CompileReports",
      () => `/api/v2/compilereport`,
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
