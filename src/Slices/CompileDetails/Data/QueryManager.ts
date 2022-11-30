import { identity } from "lodash-es";
import { Scheduler, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";

export function CompileDetailsQueryManager(
  store: Store,
  apiHelper: ApiHelper,
  scheduler: Scheduler
) {
  return QueryManager.ContinuousWithEnv<"GetCompileDetails">(
    apiHelper,
    StateHelper(store),
    scheduler,
    ({ id, kind }) => `${kind}_${id}`,
    ({ id }) => [id],
    "GetCompileDetails",
    ({ id }) => `/api/v2/compilereport/${id}`,
    identity
  );
}
