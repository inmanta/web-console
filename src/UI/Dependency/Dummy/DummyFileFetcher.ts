import { Either, FileFetcher } from "@/Core";

export class DummyFileFetcher implements FileFetcher {
  setEnvironment(): void {
    throw new Error("Method not implemented.");
  }

  get(): Promise<Either.Type<string, string>> {
    throw new Error("Method not implemented.");
  }
}
