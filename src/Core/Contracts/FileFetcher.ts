import { Either } from "@/Core/Language";

export interface FileFetcher {
  setEnvironment(environment: string): void;
  get(fileId: string): Promise<Either.Type<string, string>>;
}
