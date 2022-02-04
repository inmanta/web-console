import { identity } from "lodash";
import { Scheduler, ApiHelper, StateHelperWithEnv } from "@/Core";
import { PrimaryContinuousQueryManagerWithEnvWithStateHelperWithEnv } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class GetDryRunsQueryManager extends PrimaryContinuousQueryManagerWithEnvWithStateHelperWithEnv<"GetDryRuns"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelperWithEnv<"GetDryRuns">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ kind }, environment) => `${kind}_${environment}`,
      ({ version }, environment) => [environment, version],
      "GetDryRuns",
      getUrl,
      identity
    );
  }
}
