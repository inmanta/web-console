import { identity } from "lodash";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManagerWithEnv } from "@/Data/Managers/Helpers";

export class CompileDetailsQueryManager extends PrimaryContinuousQueryManagerWithEnv<"GetCompileDetails"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetCompileDetails">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ id, kind }) => `${kind}_${id}`,
      ({ id }) => [id],
      "GetCompileDetails",
      ({ id }) => `/api/v2/compilereport/${id}`,
      identity
    );
  }
}
