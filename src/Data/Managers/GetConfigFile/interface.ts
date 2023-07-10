export interface GetConfigFile {
  kind: "GetConfigFile";
}

export interface GetVersionFileManifest {
  error: string;
  apiResponse: { data: string };
  data: string;
  usedData: string;
  query: GetConfigFile;
}
