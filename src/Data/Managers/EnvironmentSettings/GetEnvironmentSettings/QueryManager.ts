import { identity } from "lodash-es";
import { ApiHelper, StateHelperWithEnv } from "@/Core";
import { PrimaryOneTimeQueryManagerWithEnv } from "@/Data/Managers/Helpers";

export class GetEnvironmentSettingsQueryManager extends PrimaryOneTimeQueryManagerWithEnv<"GetEnvironmentSettings"> {
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
