import { Resource } from "@/Core/Domain";

export interface Query {
  kind: "GetResourceDetails";
  id: string;
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: Resource.RawDetails;
  };
  data: Resource.Details;
  usedData: Resource.Details;
  query: Query;
}
