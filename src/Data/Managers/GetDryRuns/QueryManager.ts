import { identity } from "lodash";
import { Scheduler, ApiHelper } from "@/Core";
import { Store } from "@/Data";
import { PrimaryContinuousQueryManagerWithEnvWithStateHelperWithEnv } from "@/Data/Managers/Helpers";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export class QueryManager extends PrimaryContinuousQueryManagerWithEnvWithStateHelperWithEnv<"GetDryRuns"> {
  constructor(apiHelper: ApiHelper, store: Store, scheduler: Scheduler) {
    super(
      apiHelper,
      new StateHelper(store),
      scheduler,
      ({ kind }, environment) => `${kind}_${environment}`,
      ({ version }, environment) => [environment, version],
      "GetDryRuns",
      getUrl,
      identity
    );
  }
}
