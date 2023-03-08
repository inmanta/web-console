import { VersionedServiceInstanceIdentifier } from "@/Core/Domain";
import { Maybe } from "@/Core/Language";

export interface DestroyInstance extends VersionedServiceInstanceIdentifier {
  kind: "DestroyInstance";
}

export interface DestroyInstanceManifest {
  error: string;
  apiData: string;
  body: null;
  command: DestroyInstance;
  trigger: (refetch: () => void) => Promise<Maybe.Type<string>>;
}
