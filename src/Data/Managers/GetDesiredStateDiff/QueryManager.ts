import { identity } from "lodash-es";
import { ApiHelper, StateHelperWithEnv } from "@/Core";
import { PrimaryOneTimeQueryManagerWithEnvWithStateHelperWithEnv } from "@/Data/Managers/Helpers";

export class GetDesiredStateDiffQueryManager extends PrimaryOneTimeQueryManagerWithEnvWithStateHelperWithEnv<"GetDesiredStateDiff"> {
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
