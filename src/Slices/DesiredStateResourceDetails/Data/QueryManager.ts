import { identity } from "lodash-es";
import { Scheduler, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { GetDesiredStateResourceDetailsStateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export class GetDesiredStateResourceDetailsQueryManager extends QueryManager.ContinuousWithEnv<"GetVersionedResourceDetails"> {
  constructor(apiHelper: ApiHelper, store: Store, scheduler: Scheduler) {
    super(
      apiHelper,
      new GetDesiredStateResourceDetailsStateHelper(store),
      scheduler,
      ({ kind, version, id }) => `${kind}_${version}_${id}`,
      ({ version, id }) => [version, id],
      "GetVersionedResourceDetails",
      getUrl,
      identity
    );
  }
}
