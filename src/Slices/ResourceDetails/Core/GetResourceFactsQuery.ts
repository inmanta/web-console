import { Fact } from "@S/Facts/Core/Domain";

export interface Query {
  kind: "GetResourceFacts";
  resourceId: string;
}

export interface Manifest {
  error: string;
  apiResponse: { data: Fact[] };
  data: Fact[];
  usedData: Fact[];
  query: Query;
}
