import { identity } from "lodash-es";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManagerWithEnvWithStateHelperWithEnv } from "@/Data/Managers/Helpers";

export class GetResourceFactsQueryManager extends PrimaryContinuousQueryManagerWithEnvWithStateHelperWithEnv<"GetResourceFacts"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetResourceFacts">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ kind, resourceId }) => `${kind}_${resourceId}`,
      ({ resourceId }) => [resourceId],
      "GetResourceFacts",
      ({ resourceId }) => `/api/v2/resource/${resourceId}/facts`,
      identity
    );
  }
}
