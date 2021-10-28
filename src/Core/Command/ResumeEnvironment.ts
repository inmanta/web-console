import { Maybe } from "@/Core/Language";

export interface ResumeEnvironment {
  kind: "ResumeEnvironment";
}

export interface ResumeEnvironmentManifest {
  error: string;
  apiData: string;
  body: null;
  command: ResumeEnvironment;
  trigger: () => Promise<Maybe.Type<string>>;
}
