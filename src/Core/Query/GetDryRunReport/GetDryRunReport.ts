import { DryRun } from "@/Core/Domain";

export interface Query {
  kind: "GetDryRunReport";
  reportId: string;
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: DryRun.Report;
  };
  data: DryRun.Report;
  usedData: DryRun.Report;
  query: Query;
}
