import { EnvironmentSettings } from "@/Core/Domain";

export interface GetEnvironmentSettings {
  kind: "GetEnvironmentSettings";
}

export interface GetEnvironmentSettingsManifest {
  error: string;
  apiResponse: { data: EnvironmentSettings.EnvironmentSettings };
  data: EnvironmentSettings.EnvironmentSettings;
  usedData: EnvironmentSettings.EnvironmentSettings;
  query: GetEnvironmentSettings;
}
