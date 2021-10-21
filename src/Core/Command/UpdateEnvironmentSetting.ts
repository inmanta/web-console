import { EnvironmentSettings, Maybe } from "..";

export interface UpdateEnvironmentSetting {
  kind: "UpdateEnvironmentSetting";
}

export interface UpdateEnvironmentSettingManifest {
  error: string;
  apiData: { data: null };
  body: { value: EnvironmentSettings.Value };
  command: UpdateEnvironmentSetting;
  trigger: (
    id: string,
    value: EnvironmentSettings.Value
  ) => Promise<Maybe.Maybe<string>>;
}
