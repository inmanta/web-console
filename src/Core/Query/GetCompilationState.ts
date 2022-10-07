export interface GetCompilationState {
  kind: "GetCompilationState";
}

export interface GetCompilationStateManifest {
  error: undefined;
  apiResponse: undefined;
  data: boolean;
  usedData: boolean;
  query: GetCompilationState;
}
