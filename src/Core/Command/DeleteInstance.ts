import { VersionedServiceInstanceIdentifier } from "@/Core/Domain";
import { Maybe } from "@/Core/Language";

export interface DeleteInstance extends VersionedServiceInstanceIdentifier {
  kind: "DeleteInstance";
}

export interface DeleteInstanceManifest {
  error: string;
  apiData: string;
  body: null;
  command: DeleteInstance;
  trigger: (refetch: () => void) => Promise<Maybe.Type<string>>;
}
