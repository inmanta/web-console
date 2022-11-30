import { Maybe } from "@/Core/Language";

export interface Command {
  kind: "DeleteCallback";
  callbackId: string;
  service_entity: string;
}

export interface Manifest {
  error: string;
  apiData: string;
  body: null;
  command: Command;
  trigger: () => Promise<Maybe.Type<string>>;
}
