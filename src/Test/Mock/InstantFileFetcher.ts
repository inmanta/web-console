import { Either, FileFetcher } from "@/Core";
import { Type } from "@/Core/Language/Either";

export class InstantFileFetcher implements FileFetcher {
  setEnvironment(): void {
    throw new Error("Method not implemented.");
  }
  async get(fileId: string): Promise<Type<string, string>> {
    return Either.right(`file content for file id ${fileId}`);
  }
}
