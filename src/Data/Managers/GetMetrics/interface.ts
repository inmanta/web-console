export interface GetMetrics {
  kind: "GetMetrics";
  startDate: string;
  endDate: string;
}

export interface GetMetricsManifest {
  error: undefined;
  apiResponse: undefined;
  data: boolean;
  usedData: boolean;
  query: GetMetrics;
}
