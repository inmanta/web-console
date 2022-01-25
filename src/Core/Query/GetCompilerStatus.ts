export interface GetCompilerStatus {
  kind: "GetCompilerStatus";
}

export interface GetCompilerStatusManifest {
  error: undefined;
  apiResponse: undefined;
  data: boolean;
  usedData: boolean;
  query: GetCompilerStatus;
}
