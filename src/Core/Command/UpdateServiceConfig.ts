import { Config, ServiceIdentifier } from "@/Core/Domain";

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
