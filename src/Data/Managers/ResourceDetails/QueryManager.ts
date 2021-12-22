import { identity } from "lodash";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { PrimaryContinuousQueryManagerWithEnv } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

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
      ({ kind, id }) => `${kind}_${id}`,
      ({ id }) => [id],
      "GetResourceDetails",
      getUrl,
      identity
    );
  }
}
