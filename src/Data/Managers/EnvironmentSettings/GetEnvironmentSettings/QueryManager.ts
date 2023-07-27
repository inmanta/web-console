import { identity } from "lodash-es";
import { ApiHelper, StateHelperWithEnv } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";

export function GetEnvironmentSettingsQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelperWithEnv<"GetEnvironmentSettings">,
) {
  return QueryManager.OneTimeWithEnv<"GetEnvironmentSettings">(
    apiHelper,
    stateHelper,
    () => [],
    "GetEnvironmentSettings",
    () => `/api/v2/environment_settings`,
    identity,
  );
}
