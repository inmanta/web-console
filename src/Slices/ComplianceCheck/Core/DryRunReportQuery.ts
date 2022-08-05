import { Report } from "./Domain";

export interface Query {
  kind: "GetDryRunReport";
  version: string;
  reportId: string;
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: Report;
  };
  data: Report;
  usedData: Report;
  query: Query;
}
