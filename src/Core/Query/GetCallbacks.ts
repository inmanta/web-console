import { Callback } from "@/Core/Domain";

export interface GetCallbacks {
  kind: "GetCallbacks";
  service_entity: string;
}

export interface GetCallbacksManifest {
  error: string;
  apiResponse: { data: Callback[] };
  data: Callback[];
  usedData: Callback[];
  query: GetCallbacks;
}
