import { EnvironmentSettings } from "@/Core/Domain";
import { Maybe } from "@/Core/Language";

export interface ResetEnvironmentSetting {
  kind: "ResetEnvironmentSetting";
}

export interface ResetEnvironmentSettingManifest {
  error: string;
  apiData: undefined;
  body: { value: EnvironmentSettings.Value };
  command: ResetEnvironmentSetting;
  trigger: (id: string) => Promise<Maybe.Maybe<string>>;
}
