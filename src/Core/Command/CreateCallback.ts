import { Maybe } from "@/Core/Language";
import { CreateCallbackBody } from "@/Core/Domain";

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
