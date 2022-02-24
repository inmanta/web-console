import { EnvironmentDetails } from "@/Core/Domain";

export interface GetEnvironmentDetails {
  kind: "GetEnvironmentDetails";
  details: boolean;
  id: string;
}

export interface GetEnvironmentDetailsManifest {
  error: string;
  apiResponse: { data: EnvironmentDetails };
  data: EnvironmentDetails;
  usedData: EnvironmentDetails;
  query: GetEnvironmentDetails;
}
