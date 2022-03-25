import { identity } from "lodash-es";
import { Scheduler, ApiHelper } from "@/Core";
import { Store } from "@/Data";
import { QueryManager } from "@/Data/Managers/Helpers";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export class EnvironmentDetailsContinuousQueryManager extends QueryManager.Continuous<"GetEnvironmentDetails"> {
  constructor(store: Store, apiHelper: ApiHelper, scheduler: Scheduler) {
    super(
      apiHelper,
      new StateHelper(store),
      scheduler,
      ({ kind, id }) => `${kind}_${id}`,
      ({ id }) => [id],
      "GetEnvironmentDetails",
      ({ details, id }) => getUrl(details, id),
      identity
    );
  }
}
