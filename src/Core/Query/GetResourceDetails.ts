import { WithId } from "@/Core/Language";
import { RawResourceDetails, ResourceDetails } from "@/Core/Domain";

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
