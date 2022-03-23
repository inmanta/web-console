import { identity } from "lodash";
import { Scheduler, ApiHelper, stringifyObjectOrUndefined } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export class ContinuousManager extends QueryManager.ContinuousWithEnv<"GetNotifications"> {
  constructor(apiHelper: ApiHelper, store: Store, scheduler: Scheduler) {
    super(
      apiHelper,
      new StateHelper(store),
      scheduler,
      ({ kind, origin }, environment) => `${kind}_${environment}_${origin}`,
      ({ filter }, environment) => [
        environment,
        stringifyObjectOrUndefined(filter),
      ],
      "GetNotifications",
      getUrl,
      identity
    );
  }
}
