import { VersionedServiceInstanceIdentifier } from "@/Core/Domain";
import { Maybe } from "@/Core/Language";
import { Query } from "@/Core/Query";

export interface DeleteInstance extends VersionedServiceInstanceIdentifier {
  kind: "DeleteInstance";
}

export interface DeleteInstanceManifest {
  error: string;
  apiData: string;
  body: null;
  command: DeleteInstance;
  trigger: (
    query: Query.SubQuery<"GetServiceInstances">
  ) => Promise<Maybe.Type<string>>;
}
