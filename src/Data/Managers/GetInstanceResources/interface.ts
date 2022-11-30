import {
  InstanceResourceModel,
  VersionedServiceInstanceIdentifier,
} from "@/Core/Domain";

/**
 * The ResourcesQuery describes resources for a service instance.
 * We are not asking for 1 specific resource. We are asking for all the
 * resources of 1 specific service instance.
 */
export interface GetInstanceResources
  extends VersionedServiceInstanceIdentifier {
  kind: "GetInstanceResources";
}

export interface GetInstanceResourcesManifest {
  error: string;
  apiResponse: { data: InstanceResourceModel[] };
  data: InstanceResourceModel[];
  usedData: InstanceResourceModel[];
  query: GetInstanceResources;
}
