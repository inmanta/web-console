import { identity } from "lodash";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManager } from "@/Data/Managers/Helpers";

export class CompileDetailsQueryManager extends PrimaryContinuousQueryManager<"GetCompileDetails"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetCompileDetails">,
    scheduler: Scheduler,
    useEnvironment: () => string
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
      useEnvironment
    );
  }
}
