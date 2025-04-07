import { identity } from "lodash-es";
import { ApiHelper, StateHelperWithEnv } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "@S/ServiceDetails/Data/Callbacks/getUrl";

export function CallbacksQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelperWithEnv<"GetCallbacks">,
) {
  return QueryManager.OneTimeWithEnv<"GetCallbacks">(
    apiHelper,
    stateHelper,
    () => [],
    "GetCallbacks",
    getUrl,
    identity,
  );
}
