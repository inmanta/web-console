import { Diff } from "@/Core/Domain";

export interface Query {
  kind: "GetDesiredStateDiff";
  from: string;
  to: string;
}

export interface Manifest {
  error: string;
  apiResponse: { data: Diff.Resource[] };
  data: Diff.Resource[];
  usedData: Diff.Resource[];
  query: Query;
}
