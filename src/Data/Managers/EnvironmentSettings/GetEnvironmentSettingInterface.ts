import { EnvironmentSettings } from "@/Core/Domain";

export interface GetEnvironmentSetting {
  kind: "GetEnvironmentSetting";
  id: string;
}

export interface GetEnvironmentSettingManifest {
  error: string;
  apiResponse: { data: EnvironmentSettings.EnvironmentSettings };
  data: undefined;
  usedData: undefined;
  query: GetEnvironmentSetting;
}
