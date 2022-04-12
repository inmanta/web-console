import { Maybe } from "@/Core/Language";

export interface Command {
  kind: "TriggerDryRun";
  version: string;
}

export interface Manifest {
  error: string;
  apiData: undefined;
  body: undefined;
  command: Command;
  trigger: () => Promise<Maybe.Maybe<string>>;
}
