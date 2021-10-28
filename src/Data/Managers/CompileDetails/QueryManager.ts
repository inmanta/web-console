import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { identity } from "lodash";
import { PrimaryContinuousQueryManager } from "@/Data/Common";

export class CompileDetailsQueryManager extends PrimaryContinuousQueryManager<"GetCompileDetails"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetCompileDetails">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      apiHelper,
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
