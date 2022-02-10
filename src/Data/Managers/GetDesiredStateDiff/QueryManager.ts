import { identity } from "lodash-es";
import { ApiHelper, StateHelperWithEnv } from "@/Core";
import { PrimaryOneTimeQueryManagerWithEnv } from "@/Data/Managers/Helpers";

export class GetDesiredStateDiffQueryManager extends PrimaryOneTimeQueryManagerWithEnv<"GetDesiredStateDiff"> {
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
