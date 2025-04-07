import { identity } from "lodash-es";
import { ApiHelper, StateHelperWithEnv } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";

export function GetDesiredStateDiffQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelperWithEnv<"GetDesiredStateDiff">
) {
  return QueryManager.OneTimeWithEnv<"GetDesiredStateDiff">(
    apiHelper,
    stateHelper,
    ({ from, to }, env) => [to, from, env],
    "GetDesiredStateDiff",
    ({ from, to }) => `/api/v2/desiredstate/diff/${from}/${to}`,
    identity
  );
}
