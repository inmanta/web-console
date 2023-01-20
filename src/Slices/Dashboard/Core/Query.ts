import { BackendMetricData } from "./Domain";

export interface Query {
  kind: "GetMetrics";
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: BackendMetricData;
  };
  data: BackendMetricData;
  usedData: BackendMetricData;
  query: Query;
}
