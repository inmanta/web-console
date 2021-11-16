import { identity } from "lodash";
import { StateHelper, ApiHelper } from "@/Core";
import { PrimaryOneTimeQueryManagerWithEnv } from "@/Data/Managers/Helpers";

export class GetEnvironmentSettingsQueryManager extends PrimaryOneTimeQueryManagerWithEnv<"GetEnvironmentSettings"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetEnvironmentSettings">
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
