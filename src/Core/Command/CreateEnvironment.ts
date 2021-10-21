import { CreateEnvironmentParams } from "@/Core/Domain";
import { Maybe } from "@/Core/Language";

export interface CreateEnvironment {
  kind: "CreateEnvironment";
}

export interface CreateEnvironmentManifest {
  error: string;
  apiData: string;
  body: CreateEnvironmentParams;
  command: CreateEnvironment;
  trigger: (body: CreateEnvironmentParams) => Promise<Maybe.Type<string>>;
}
