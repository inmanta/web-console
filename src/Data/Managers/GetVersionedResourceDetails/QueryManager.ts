import { identity } from "lodash-es";
import { Scheduler, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export class Manager extends QueryManager.ContinuousWithEnv<"GetVersionedResourceDetails"> {
  constructor(apiHelper: ApiHelper, store: Store, scheduler: Scheduler) {
    super(
      apiHelper,
      new StateHelper(store),
      scheduler,
      ({ kind, version, id }) => `${kind}_${version}_${id}`,
      ({ version, id }) => [version, id],
      "GetVersionedResourceDetails",
      getUrl,
      identity
    );
  }
}
