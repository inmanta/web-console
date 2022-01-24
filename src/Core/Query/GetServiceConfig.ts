import { ServiceIdentifier, Config } from "@/Core/Domain";

export interface GetServiceConfig extends ServiceIdentifier {
  kind: "GetServiceConfig";
}

export interface GetServiceConfigManifest {
  error: string;
  apiResponse: { data: Config };
  data: Config;
  usedData: Config;
  query: GetServiceConfig;
}
