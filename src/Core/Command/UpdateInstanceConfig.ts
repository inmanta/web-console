import { Config, VersionedServiceInstanceIdentifier } from "@/Core/Domain";

/**
 * The instanceConfig command updates the config belonging to one specific service instance
 */
export interface UpdateInstanceConfig
  extends VersionedServiceInstanceIdentifier {
  kind: "UpdateInstanceConfig";
}

export interface UpdateInstanceConfigManifest {
  error: string;
  apiData: { data: Config };
  body: { values: Config };
  command: UpdateInstanceConfig;
  trigger: (
    payload:
      | { kind: "RESET" }
      | { kind: "UPDATE"; option: string; value: boolean }
  ) => void;
}
