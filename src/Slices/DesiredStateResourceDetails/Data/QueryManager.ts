import { identity } from "lodash-es";
import { Scheduler, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { GetDesiredStateResourceDetailsStateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export function GetDesiredStateResourceDetailsQueryManager(
  apiHelper: ApiHelper,
  store: Store,
  scheduler: Scheduler
) {
  return QueryManager.ContinuousWithEnv<"GetVersionedResourceDetails">(
    apiHelper,
    GetDesiredStateResourceDetailsStateHelper(store),
    scheduler,
    ({ kind, version, id }) => `${kind}_${version}_${id}`,
    ({ version, id }) => [version, id],
    "GetVersionedResourceDetails",
    getUrl,
    identity
  );
}
