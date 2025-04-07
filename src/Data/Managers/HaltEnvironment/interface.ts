import { Maybe } from "@/Core/Language";

export interface HaltEnvironment {
  kind: "HaltEnvironment";
}

export interface HaltEnvironmentManifest {
  error: string;
  apiData: string;
  body: null;
  command: HaltEnvironment;
  trigger: () => Promise<Maybe.Type<string>>;
}
