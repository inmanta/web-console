import { EnvironmentDetails } from "@/Core/Domain";

export interface Query {
  kind: "GetEnvironmentDetails";
  details: boolean;
  id: string;
}

export interface Manifest {
  error: string;
  apiResponse: { data: EnvironmentDetails };
  data: EnvironmentDetails;
  usedData: EnvironmentDetails;
  query: Query;
}
