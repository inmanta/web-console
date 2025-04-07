import { Maybe } from "@/Core/Language";
import { CreateCallbackBody } from "./Callback";

export interface Command extends CreateCallbackBody {
  kind: "CreateCallback";
}

export interface Manifest {
  error: string;
  apiData: { data: string };
  body: CreateCallbackBody;
  command: Command;
  trigger: () => Promise<Maybe.Type<string>>;
}
