import { identity } from "lodash";
import { StateHelper, ApiHelper } from "@/Core";
import { PrimaryOneTimeQueryManager } from "@/Data/Managers/Helpers";

export class GetEnvironmentSettingsQueryManager extends PrimaryOneTimeQueryManager<"GetEnvironmentSettings"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetEnvironmentSettings">,
    environment: string
  ) {
    super(
      apiHelper,
      stateHelper,
      () => [],
      "GetEnvironmentSettings",
      () => `/api/v2/environment_settings`,
      identity,
      environment
    );
  }
}
