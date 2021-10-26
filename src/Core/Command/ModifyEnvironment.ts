import { Maybe } from "@/Core/Language";
import { ModifyEnvironmentParams } from "@/Core/Domain";

export interface ModifyEnvironment {
  kind: "ModifyEnvironment";
}

export interface ModifyEnvironmentManifest {
  error: string;
  apiData: string;
  body: ModifyEnvironmentParams;
  command: ModifyEnvironment;
  trigger: (body: ModifyEnvironmentParams) => Promise<Maybe.Type<string>>;
}
