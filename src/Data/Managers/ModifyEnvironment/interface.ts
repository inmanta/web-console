import { ModifyEnvironmentParams } from "@/Core/Domain";
import { Maybe } from "@/Core/Language";

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
