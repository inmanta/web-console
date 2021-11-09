import { CreateCallbackBody } from "@/Core/Domain";
import { Maybe } from "@/Core/Language";

export interface CreateCallback extends CreateCallbackBody {
  kind: "CreateCallback";
}

export interface CreateCallbackManifest {
  error: string;
  apiData: { data: string };
  body: CreateCallbackBody;
  command: CreateCallback;
  trigger: () => Promise<Maybe.Type<string>>;
}
