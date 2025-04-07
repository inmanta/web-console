import { DryRun } from "@S/ComplianceCheck/Core/Domain";

export interface Query {
  kind: "GetDryRuns";
  version: number;
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: DryRun[];
  };
  data: DryRun[];
  usedData: DryRun[];
  query: Query;
}
