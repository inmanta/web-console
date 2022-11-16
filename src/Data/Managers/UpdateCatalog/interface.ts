import { Either } from "@/Core/Language";

export interface UpdateCatalog {
  kind: "UpdateCatalog";
}

export interface UpdateCatalogManifest {
  error: string;
  apiData: string;
  body: null;
  command: UpdateCatalog;
  trigger: () => Promise<Either.Either<string, string>>;
}
