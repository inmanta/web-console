import { ServiceInstanceIdentifier, Config } from "@/Core/Domain";

/**
 * The instanceConfig query describes the config belonging to one specific service instance
 */
export interface GetInstanceConfig extends ServiceInstanceIdentifier {
  kind: "GetInstanceConfig";
}

export interface GetInstanceConfigManifest {
  error: string;
  apiResponse: { data: Config };
  data: Config;
  usedData: { config: Config; defaults: Config };
  query: GetInstanceConfig;
}
