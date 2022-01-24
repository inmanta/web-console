import { Resource } from "@/Core/Domain";
import { WithId } from "@/Core/Language";

export interface GetResourceDetails extends WithId {
  kind: "GetResourceDetails";
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
