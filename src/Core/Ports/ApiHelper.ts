import { Either } from "@/Core";

/**
 * The ApiHelper provides basic api helper methods.
 */
export interface ApiHelper {
  getBaseUrl(): string;
  get<Data>(
    url: string,
    environment: string
  ): Promise<Either.Type<string, Data>>;
  post<Data, Body = Data>(
    url: string,
    environment: string,
    body: Body
  ): Promise<Either.Type<string, Data>>;
}
