import { FlatEnvironment } from "@/Core/Domain";

export interface Query {
  kind: "GetEnvironmentDetails";
  details: boolean;
  id: string;
}

export interface Manifest {
  error: string;
  apiResponse: { data: FlatEnvironment };
  data: FlatEnvironment;
  usedData: FlatEnvironment;
  query: Query;
}
