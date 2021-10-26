import { Maybe } from "@/Core/Language";
import { VersionedServiceInstanceIdentifier } from "@/Core/Domain";

export interface DeleteInstance extends VersionedServiceInstanceIdentifier {
  kind: "DeleteInstance";
}

export interface DeleteInstanceManifest {
  error: string;
  apiData: string;
  body: null;
  command: DeleteInstance;
  trigger: () => Promise<Maybe.Type<string>>;
}
