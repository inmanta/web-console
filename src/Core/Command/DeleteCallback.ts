import { Maybe } from "@/Core/Language";

export interface DeleteCallback {
  kind: "DeleteCallback";
  callbackId: string;
  service_entity: string;
}

export interface DeleteCallbackManifest {
  error: string;
  apiData: string;
  body: null;
  command: DeleteCallback;
  trigger: () => Promise<Maybe.Type<string>>;
}
