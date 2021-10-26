import { Fetcher, StateHelper, Scheduler } from "@/Core";
import { identity } from "lodash";
import { ContinuousQueryManagerImpl } from "@/Data/Common";

export class CompileDetailsQueryManager extends ContinuousQueryManagerImpl<"GetCompileDetails"> {
  constructor(
    fetcher: Fetcher<"GetCompileDetails">,
    stateHelper: StateHelper<"GetCompileDetails">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      ({ id }) => id,
      ({ id }) => [id],
      "GetCompileDetails",
      ({ id }) => `/api/v2/compilereport/${id}`,
      identity,
      environment
    );
  }
}
