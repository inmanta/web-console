import { BackendMetricData } from "@/Slices/Dashboard/Core/Domain";

export interface GetMetrics {
  kind: "GetMetrics";
  startDate: string;
  endDate: string;
}

export interface GetMetricsManifest {
  error: string;
  apiData: { data: BackendMetricData };
  data: BackendMetricData;
  usedData: boolean;
  query: GetMetrics;
}
