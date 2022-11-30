import { identity } from "lodash-es";
import { Scheduler, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export function EnvironmentDetailsContinuousQueryManager(
  store: Store,
  apiHelper: ApiHelper,
  scheduler: Scheduler
) {
  return QueryManager.Continuous<"GetEnvironmentDetails">(
    apiHelper,
    StateHelper(store),
    scheduler,
    ({ kind, id }) => `${kind}_${id}`,
    ({ id }) => [id],
    "GetEnvironmentDetails",
    ({ details, id }) => getUrl(details, id),
    identity
  );
}
