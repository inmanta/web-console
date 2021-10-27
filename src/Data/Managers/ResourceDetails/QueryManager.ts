import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { identity } from "lodash";
import { PrimaryContinuousQueryManager } from "@/Data/Common";

export class ResourceDetailsQueryManager extends PrimaryContinuousQueryManager<"GetResourceDetails"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetResourceDetails">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ id }) => id,
      ({ id }) => [id],
      "GetResourceDetails",
      ({ id }) => `/api/v2/resource/${id}`,
      identity,
      environment
    );
  }
}
