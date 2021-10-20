import { EnvironmentSettings } from "@/Core/Domain";

export interface GetEnvironmentSettings {
  kind: "GetEnvironmentSettings";
}

export interface GetEnvironmentSettingsManifest {
  error: string;
  apiResponse: { data: EnvironmentSettings };
  data: EnvironmentSettings;
  usedData: EnvironmentSettings;
  query: GetEnvironmentSettings;
}
