import { EnvironmentSettings } from "@/Core/Domain";
import { Maybe } from "@/Core/Language";

export interface UpdateEnvironmentSetting {
  kind: "UpdateEnvironmentSetting";
}

export interface UpdateEnvironmentSettingManifest {
  error: string;
  apiData: undefined;
  body: { value: EnvironmentSettings.Value };
  command: UpdateEnvironmentSetting;
  trigger: (
    id: string,
    value: EnvironmentSettings.Value,
  ) => Promise<Maybe.Maybe<string>>;
}
