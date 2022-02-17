import { Resource } from "@/Core/Domain";
import { WithId } from "@/Core/Language";

export interface Query extends WithId {
  kind: "GetVersionedResourceDetails";
  version: string;
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: Resource.VersionedDetails;
  };
  data: Resource.VersionedDetails;
  usedData: Resource.VersionedDetails;
  query: Query;
}
