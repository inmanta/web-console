import { Resource } from "@/Core/Domain";

export interface Query {
  kind: "GetVersionedResourceDetails";
  id: string;
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
