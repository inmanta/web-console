import { VersionInfo } from "@/Core/Domain";

export interface GetVersionFile {
  kind: "GetVersionFile";
}

export interface GetVersionFileManifest {
  error: string;
  apiResponse: { data: VersionInfo };
  data: VersionInfo;
  usedData: VersionInfo;
  query: GetVersionFile;
}
