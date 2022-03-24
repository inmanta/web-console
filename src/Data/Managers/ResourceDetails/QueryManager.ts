import { identity } from "lodash-es";
import { StateHelper, Scheduler, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class ResourceDetailsQueryManager extends QueryManager.ContinuousWithEnv<"GetResourceDetails"> {
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
