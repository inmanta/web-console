import { identity } from "lodash-es";
import { Scheduler, ApiHelper, StateHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class EnvironmentDetailsQueryManager extends QueryManager.Continuous<"GetEnvironmentDetails"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetEnvironmentDetails">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ kind, id }) => `${kind}_${id}`,
      ({ id }) => [id],
      "GetEnvironmentDetails",
      ({ details, id }) => getUrl(details, id),
      identity
    );
  }
}
