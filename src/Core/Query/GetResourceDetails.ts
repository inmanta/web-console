import { RawResourceDetails, ResourceDetails } from "@/Core/Domain";
import { WithId } from "@/Core/Language";

export interface GetResourceDetails extends WithId {
  kind: "GetResourceDetails";
}

export interface GetResourceDetailsManifest {
  error: string;
  apiResponse: {
    data: RawResourceDetails;
  };
  data: ResourceDetails;
  usedData: ResourceDetails;
  query: GetResourceDetails;
}
