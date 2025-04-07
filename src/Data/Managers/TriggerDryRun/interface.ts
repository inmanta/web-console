import { Maybe } from "@/Core/Language";

export interface TriggerDryRun {
  kind: "TriggerDryRun";
  version: string;
}

export interface TriggerDryRunManifest {
  error: string;
  apiData: undefined;
  body: undefined;
  command: TriggerDryRun;
  trigger: () => Promise<Maybe.Maybe<string>>;
}
