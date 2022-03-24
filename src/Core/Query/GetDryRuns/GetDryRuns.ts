import { DryRun } from "@/Core/Domain";

export interface Query {
  kind: "GetDryRuns";
  version: number;
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: DryRun.Model[];
  };
  data: DryRun.Model[];
  usedData: DryRun.Model[];
  query: Query;
}
