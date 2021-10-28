import { ServerStatus } from "@/Core/Domain";

export interface GetServerStatus {
  kind: "GetServerStatus";
}

export interface GetServerStatusManifest {
  error: string;
  apiResponse: { data: ServerStatus };
  data: ServerStatus;
  usedData: ServerStatus;
  query: GetServerStatus;
}
