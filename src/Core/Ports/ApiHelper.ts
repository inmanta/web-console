import { Either } from "@/Core";

/**
 * The ApiHelper provides basic api helper methods.
 */
export interface ApiHelper {
  getBaseUrl(): string;
  delete(
    url: string,
    environment: string
  ): Promise<Either.Type<string, string>>;
  get<Data>(
    url: string,
    environment: string
  ): Promise<Either.Type<string, Data>>;
  post<Data, Body = unknown>(
    url: string,
    environment: string,
    body: Body
  ): Promise<Either.Type<string, Data>>;
  postEmptyResponse<Body>(
    url: string,
    environment: string,
    body: Body
  ): Promise<Either.Type<string, string>>;
  patch<Body = unknown>(
    url: string,
    environment: string,
    body: Body
  ): Promise<Either.Type<string, string>>;
}
