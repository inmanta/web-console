import { identity } from "lodash-es";
import { ApiHelper, StateHelperWithEnv } from "@/Core";
import { PrimaryOneTimeQueryManagerWithEnvWithStateHelperWithEnv } from "@/Data/Managers/Helpers";

export class GetEnvironmentSettingsQueryManager extends PrimaryOneTimeQueryManagerWithEnvWithStateHelperWithEnv<"GetEnvironmentSettings"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelperWithEnv<"GetEnvironmentSettings">
  ) {
    super(
      apiHelper,
      stateHelper,
      () => [],
      "GetEnvironmentSettings",
      () => `/api/v2/environment_settings`,
      identity
    );
  }
}
