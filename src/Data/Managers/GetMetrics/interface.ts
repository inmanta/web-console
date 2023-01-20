export interface GetMetrics {
  kind: "GetMetrics";
}

export interface GetMetricsManifest {
  error: undefined;
  apiResponse: undefined;
  data: boolean;
  usedData: boolean;
  query: GetMetrics;
}
