import { identity } from "lodash-es";
import { ApiHelper, StateHelperWithEnv } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";

export class GetDesiredStateDiffQueryManager extends QueryManager.OneTimeWithEnv<"GetDesiredStateDiff"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelperWithEnv<"GetDesiredStateDiff">
  ) {
    super(
      apiHelper,
      stateHelper,
      ({ from, to }, env) => [to, from, env],
      "GetDesiredStateDiff",
      ({ from, to }) => `/api/v2/desiredstate/diff/${from}/${to}`,
      identity
    );
  }
}
