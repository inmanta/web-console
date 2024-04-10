import { ServiceInstanceModel } from "@/Core/Domain";

export interface GetInstanceWithRelations {
  kind: "GetInstanceWithRelations";
  id: string;
}

export interface GetInstanceWithRelationsManifest {
  error: string;
  apiResponse: { data: ServiceInstanceModel };
  data: InstanceWithReferences;
  usedData: InstanceWithReferences;
  query: GetInstanceWithRelations;
}

export interface InstanceWithReferences {
  instance: ServiceInstanceModel;
  relatedInstances: InstanceWithReferences[];
}
