import { Maybe } from "@/Core/Language";

export interface Command {
  kind: "ClearEnvironment";
  id: string;
}

export interface Manifest {
  error: string;
  apiData: string;
  body: null;
  command: Command;
  trigger: () => Promise<Maybe.Type<string>>;
}
