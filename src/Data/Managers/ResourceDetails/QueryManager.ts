import { identity } from "lodash";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManagerWithEnv } from "@/Data/Managers/Helpers";

export class ResourceDetailsQueryManager extends PrimaryContinuousQueryManagerWithEnv<"GetResourceDetails"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetResourceDetails">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ id }) => id,
      ({ id }) => [id],
      "GetResourceDetails",
      ({ id }) => `/api/v2/resource/${id}`,
      identity
    );
  }
}
