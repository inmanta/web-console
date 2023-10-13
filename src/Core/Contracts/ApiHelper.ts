import { Either, Maybe } from "@/Core/Language";

export interface ErrorWithHTTPCode {
  message: string;
  status: number;
}

/**
 * The ApiHelper provides basic api helper methods.
 */
export interface ApiHelper {
  get<Data>(
    url: string,
    environment: string,
  ): Promise<Either.Type<string, Data>>;
  getWithoutEnvironment<Data>(url: string): Promise<Either.Type<string, Data>>;
  post<Data, Body = unknown>(
    url: string,
    environment: string,
    body: Body,
  ): Promise<Either.Type<string, Data>>;
  postWithoutResponse<Body>(
    url: string,
    environment: string,
    body: Body,
  ): Promise<Maybe.Type<string>>;
  postWithoutResponseAndEnvironment<Body>(
    url: string,
    body: Body,
  ): Promise<Maybe.Type<string>>;
  patch<Body = unknown>(
    url: string,
    environment: string,
    body: Body,
  ): Promise<Maybe.Type<string>>;
  putWithoutEnvironment<Data, Body>(
    url: string,
    body: Body,
  ): Promise<Either.Type<string, Data>>;
  delete(url: string, environment: string): Promise<Maybe.Type<string>>;
  head(url: string): Promise<number>;
  getWithHTTPCode<Data>(
    url: string,
    environment: string,
  ): Promise<Either.Type<ErrorWithHTTPCode, Data>>;
}
