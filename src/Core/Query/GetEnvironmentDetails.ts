import { EnvironmentDetails } from "@/Core/Domain";

export interface GetEnvironmentDetails {
  kind: "GetEnvironmentDetails";
}

export interface GetEnvironmentDetailsManifest {
  error: string;
  apiResponse: { data: EnvironmentDetails };
  data: EnvironmentDetails;
  usedData: EnvironmentDetails;
  query: GetEnvironmentDetails;
}
