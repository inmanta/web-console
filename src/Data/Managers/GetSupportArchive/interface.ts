import { Either } from "@/Core/Language";

export interface GetSupportArchive {
  kind: "GetSupportArchive";
}

export interface GetSupportArchiveManifest {
  error: string;
  apiData: Blob;
  body: undefined;
  command: GetSupportArchive;
  trigger: () => Promise<Either.Type<string, Blob>>;
}
