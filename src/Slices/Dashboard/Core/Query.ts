import { BackendMetricData } from "./Domain";

export interface Query {
  kind: "GetMetrics";
  startDate: string;
  endDate: string;
  isLsmAvailable: boolean;
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
