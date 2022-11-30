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

export interface UpdateServiceConfig extends ServiceIdentifier {
  kind: "UpdateServiceConfig";
}

export interface UpdateServiceConfigManifest {
  error: string;
  apiData: { data: Config };
  body: { values: Config };
  command: UpdateServiceConfig;
  trigger: (option: string, value: boolean) => void;
}
