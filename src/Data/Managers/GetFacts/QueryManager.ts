import { identity } from "lodash-es";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManagerWithEnv } from "@/Data/Managers/Helpers";

export class GetFactsQueryManager extends PrimaryContinuousQueryManagerWithEnv<"GetFacts"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetFacts">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ kind, resourceId }) => `${kind}_${resourceId}`,
      ({ resourceId }) => [resourceId],
      "GetFacts",
      ({ resourceId }) => `/api/v2/resource/${resourceId}/facts`,
      identity
    );
  }
}
