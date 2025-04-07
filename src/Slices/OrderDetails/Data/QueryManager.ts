import { identity } from "lodash-es";
import { Scheduler, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { GetOrderDetailsStateHelper } from "./StateHelper";

export function GetOrderDetailsQueryManager(
  apiHelper: ApiHelper,
  store: Store,
  scheduler: Scheduler,
) {
  return QueryManager.ContinuousWithEnv<"GetOrderDetails">(
    apiHelper,
    GetOrderDetailsStateHelper(store),
    scheduler,
    ({ id, kind }) => `${kind}_${id}`,
    ({ id }) => [id],
    "GetOrderDetails",
    ({ id }) => `/lsm/v2/order/${id}`,
    identity,
  );
}
