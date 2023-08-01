import { identity } from "lodash-es";
import { ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";

export function GetAgentProcessQueryManager(
  store: Store,
  apiHelper: ApiHelper,
) {
  return QueryManager.OneTimeWithEnv<"GetAgentProcess">(
    apiHelper,
    StateHelper(store),
    ({ id }) => [id],
    "GetAgentProcess",
    ({ id }) => `/api/v2/agents/process/${id}?report=True`,
    identity,
  );
}
