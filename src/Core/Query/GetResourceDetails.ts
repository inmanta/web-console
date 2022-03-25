import { Resource } from "@/Core/Domain";

export interface GetResourceDetails {
  kind: "GetResourceDetails";
  id: string;
}

export interface GetResourceDetailsManifest {
  error: string;
  apiResponse: {
    data: Resource.RawDetails;
  };
  data: Resource.Details;
  usedData: Resource.Details;
  query: GetResourceDetails;
}
