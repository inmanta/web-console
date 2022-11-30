export interface VersionInfo {
  version_info: VersionFileContent;
}

interface VersionFileContent {
  buildDate: string;
  version: string;
  commitHash: string;
}
