import { identity } from "lodash";
import { ApiHelper, StateHelper } from "@/Core";
import { PrimaryOneTimeQueryManagerWithEnv } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class QueryManager extends PrimaryOneTimeQueryManagerWithEnv<"GetDryRunReport"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetDryRunReport">
  ) {
    super(
      apiHelper,
      stateHelper,
      ({ reportId }, environment) => [environment, reportId],
      "GetDryRunReport",
      getUrl,
      identity
    );
  }
}
