import { Either } from "@/Core/Language";

export interface ReloadCatalog {
  kind: "ReloadCatalog";
}

export interface ReloadCatalogManifest {
  error: string;
  apiData: string;
  body: null;
  command: ReloadCatalog;
  trigger: () => Promise<Either.Either<string, string>>;
}
