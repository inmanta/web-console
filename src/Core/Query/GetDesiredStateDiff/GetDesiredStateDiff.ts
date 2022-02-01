import { Diff } from "@/Core/Domain";

export interface Query extends Diff.Identifiers {
  kind: "GetDesiredStateDiff";
}

export interface Manifest {
  error: string;
  apiResponse: { data: Diff.Resource[] };
  data: Diff.Resource[];
  usedData: Diff.Resource[];
  query: Query;
}
