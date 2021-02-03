import { Either } from "@/Core";

export interface ResourceFetcher {
  getResources(
    id: string,
    entity: string,
    version: string,
    environment: string
  ): Promise<Either.Type<string, unknown>>;
}
