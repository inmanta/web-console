import { Either, Maybe } from "@/Core/Language";

/**
 * The ApiHelper provides basic api helper methods.
 */
export interface ApiHelper {
  getBaseUrl(): string;
  delete(url: string, environment: string): Promise<Maybe.Type<string>>;
  get<Data>(
    url: string,
    environment: string
  ): Promise<Either.Type<string, Data>>;
  getWithoutEnvironment<Data>(url: string): Promise<Either.Type<string, Data>>;
  post<Data, Body = unknown>(
    url: string,
    environment: string,
    body: Body
  ): Promise<Either.Type<string, Data>>;
  postWithoutResponse<Body>(
    url: string,
    environment: string,
    body: Body
  ): Promise<Maybe.Type<string>>;
  patch<Body = unknown>(
    url: string,
    environment: string,
    body: Body
  ): Promise<Maybe.Type<string>>;
}
