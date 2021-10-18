import { Fetcher, StateHelper, Scheduler } from "@/Core";
import { identity } from "lodash";
import { ContinuousQueryManagerImpl } from "@/Data/Common";

export class CompileDetailsQueryManager extends ContinuousQueryManagerImpl<"CompileDetails"> {
  constructor(
    fetcher: Fetcher<"CompileDetails">,
    stateHelper: StateHelper<"CompileDetails">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      ({ id }) => id,
      ({ id }) => [id],
      "CompileDetails",
      ({ id }) => `/api/v2/compilereport/${id}`,
      identity,
      environment
    );
  }
}
