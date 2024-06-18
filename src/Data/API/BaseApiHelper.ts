import { useContext } from "react";
import { identity } from "lodash-es";
import {
  ApiHelper,
  Either,
  Maybe,
  objectHasKey,
  isObject,
  ErrorWithHTTPCode,
} from "@/Core";
import { words } from "@/UI/words";
import { AuthContext } from "../Auth/AuthContext";
import { BigIntJsonParser } from "./BigIntJsonParser";

/**
 * Helper class for making API calls.
 */
export const BaseApiHelper = (
  baseUrl: string = "http://localhost:8888",
): ApiHelper => {
  const useAuth = useContext(AuthContext);
  const jsonParser = new BigIntJsonParser();

  /**
   * Makes a HEAD request to the specified URL.
   * @param url The URL to make the HEAD request to.
   * @returns A promise resolving to the HTTP status code of the response.
   */
  async function head(url: string): Promise<number> {
    try {
      const response = await fetch(getFullUrl(url), {
        method: "HEAD",
        headers: getHeaders(),
      });

      return response.status;
    } catch (error) {
      return 500;
    }
  }
  /**
   * Gets the bearer token for authentication based on the available authentication method.
   * @returns An object containing the authorization header with the bearer token if available.
   */
  function getBearerToken(): { Authorization: string } | Record<string, never> {
    if (useAuth.getToken()) {
      return { Authorization: `Bearer ${useAuth.getToken()}` };
    }

    return {};
  }

  /**
   * Generates headers for API requests.
   * @param environment The environment for which headers are to be generated.
   * @returns Headers object including bearer token and environment information if provided.
   */

  function getHeaders(environment?: string): Record<string, string> {
    return {
      ...(environment ? { "X-Inmanta-Tid": environment } : {}),
      ...getBearerToken(),
    };
  }

  /**
   * Formats error messages for API requests. If the response status is 401 or 403, it will also handle the authorization flow.
   * @param message The error message.
   * @param response The response object.
   * @returns Formatted error message including status code and status text.
   */
  function formatError(message: string, response: Response): string {
    let errorMessage = message;
    if (response.status === 401 || response.status === 403) {
      errorMessage += ` ${words("error.authorizationFailed")}`;

      useAuth.login();
    }

    return words("error.server.intro")(
      `${response.status} ${response.statusText} \n${errorMessage}`,
    );
  }

  /**
   * Checks if an error object has a message property.
   * @param error The error object to check.
   * @returns True if the error object has a message property, false otherwise.
   */
  function errorHasMessage(error: unknown): error is { message: string } {
    if (!isObject(error)) return false;
    if (!objectHasKey(error, "message")) return false;
    return typeof error.message === "string";
  }

  /**
   * Executes a JSON request.
   * @param params Parameters for the fetch function.
   * @returns A promise resolving to an either type containing either the response data or an error message.
   */
  async function executeJson<Data>(
    ...params: Parameters<typeof fetch>
  ): Promise<Either.Type<string, Data>> {
    return execute<Data, string>(
      async (response) => jsonParser.parse(await response.text()),
      identity,
      ...params,
    );
  }

  /**
   * Executes a request without expecting a response.
   * @param params Parameters for the fetch function.
   * @returns A promise resolving to maybe a string if an error occurred, or none if request was successful.
   */
  async function executeWithoutResponse(
    ...params: Parameters<typeof fetch>
  ): Promise<Maybe.Type<string>> {
    const result = await execute<string, string>(
      (response) => response.text(),
      identity,
      ...params,
    );
    return Either.isLeft(result) ? Maybe.some(result.value) : Maybe.none();
  }

  /**
   * Gets the full URL by combining the base URL with the provided URL.
   * @param url The URL to append to the base URL.
   * @returns The full URL.
   */
  function getFullUrl(url: string): string {
    return `${baseUrl}${url}`;
  }

  /**
   * Makes a GET request to the specified URL with an environment.
   * @param url The URL to make the GET request to.
   * @param environment The environment for which the request is made.
   * @returns A promise resolving to either the response data or an error message.
   */
  async function get<Data>(
    url: string,
    environment: string,
  ): Promise<Either.Type<string, Data>> {
    return executeJson<Data>(getFullUrl(url), {
      headers: getHeaders(environment),
    });
  }

  /**
   * Makes a GET request to the specified URL without specifying an environment.
   * @param url The URL to make the GET request to.
   * @returns A promise resolving to either the response data or an error message.
   */
  async function getWithoutEnvironment<Data>(
    url: string,
  ): Promise<Either.Type<string, Data>> {
    return executeJson<Data>(getFullUrl(url), {
      headers: getHeaders(),
    });
  }

  /**
   * Makes a GET request to the specified URL without specifying an environment, expecting a blob response.
   * @param url The URL to make the GET request to.
   * @returns A promise resolving to either the response data or an error message.
   */
  async function getZipWithoutEnvironment<Blob>(
    url: string,
  ): Promise<Either.Type<string, Blob>> {
    return executeBlob<Blob, string>(identity, getFullUrl(url), {
      headers: getHeaders(),
    });
  }

  /**
   * Makes a POST request to the specified URL with specified environment and request body.
   * @param url The URL to make the POST request to.
   * @param environment The environment for which the request is made.
   * @param body The request body.
   * @returns A promise resolving to either the response data or an error message.
   */
  async function post<Data, Body>(
    url: string,
    environment: string,
    body: Body,
  ): Promise<Either.Type<string, Data>> {
    return executeJson<Data>(getFullUrl(url), {
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(environment),
      },
      method: "POST",
      body: jsonParser.stringify(body),
    });
  }

  /**
   * Makes a POST request to the specified URL without expecting a response.
   * @param url The URL to make the POST request to.
   * @param environment The environment for which the request is made.
   * @param body The request body.
   * @returns A promise resolving to maybe a string if an error occurred, or none if request was successful.
   */
  async function postWithoutResponse<Body>(
    url: string,
    environment: string,
    body: Body,
  ): Promise<Maybe.Type<string>> {
    return executeWithoutResponse(getFullUrl(url), {
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(environment),
      },
      method: "POST",
      body: jsonParser.stringify(body),
    });
  }

  /**
   * Makes a POST request to the specified URL without specifying an environment.
   * @param url The URL to make the POST request to.
   * @param body The request body.
   * @returns A promise resolving to maybe a string if an error occurred, or none if request was successful.
   */
  async function postWithoutResponseAndEnvironment<Body>(
    url: string,
    body: Body,
  ): Promise<Maybe.Type<string>> {
    return executeWithoutResponse(getFullUrl(url), {
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      method: "POST",
      body: jsonParser.stringify(body),
    });
  }

  /**
   * Makes a PUT request to the specified URL without specifying an environment.
   * @param url The URL to make the PUT request to.
   * @param body The request body.
   * @returns A promise resolving to either the response data or an error message.
   */
  function putWithoutEnvironment<Data, Body>(
    url: string,
    body: Body,
  ): Promise<Either.Type<string, Data>> {
    return executeJson(getFullUrl(url), {
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      method: "PUT",
      body: jsonParser.stringify(body),
    });
  }

  /**
   * Makes a PATCH request to the specified URL with specified environment and request body.
   * @param url The URL to make the PATCH request to.
   * @param environment The environment for which the request is made.
   * @param body The request body.
   * @returns A promise resolving to maybe a string if an error occurred, or none if request was successful.
   */
  async function patch<Body>(
    url: string,
    environment: string,
    body: Body,
  ): Promise<Maybe.Type<string>> {
    return executeWithoutResponse(getFullUrl(url), {
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(environment),
      },
      method: "PATCH",
      body: jsonParser.stringify(body),
    });
  }

  /**
   * Makes a DELETE request to the specified URL with specified environment.
   * @param url The URL to make the DELETE request to.
   * @param environment The environment for which the request is made.
   * @returns A promise resolving to maybe a string if an error occurred, or none if request was successful.
   */
  async function toDelete(
    url: string,
    environment: string,
  ): Promise<Maybe.Type<string>> {
    return executeWithoutResponse(getFullUrl(url), {
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(environment),
      },
      method: "DELETE",
    });
  }

  /**
   * Makes a GET request to the specified URL with specified environment, expecting a response with HTTP code.
   * @param url The URL to make the GET request to.
   * @param environment The environment for which the request is made.
   * @returns A promise resolving to either the response data or an error message with HTTP code.
   */
  function getWithHTTPCode<Data>(
    url: string,
    environment: string,
  ): Promise<Either.Type<ErrorWithHTTPCode, Data>> {
    return execute<Data, ErrorWithHTTPCode>(
      async (response) => jsonParser.parse(await response.text()),
      async (message, status) => ({ message, status }),
      getFullUrl(url),
      { headers: getHeaders(environment) },
    );
  }

  /**
   * Executes a request with Blob response handling.
   * @template Blob The type of Blob response.
   * @template Error The type of error expected.
   * @param transformError A function to transform error messages.
   * @param params Parameters for the fetch function.
   * @returns A promise resolving to either the response Blob data or an error message.
   */
  async function executeBlob<Blob, Error>(
    transformError: (message: string, status: number) => Promise<Error>,
    ...params: Parameters<typeof fetch>
  ): Promise<Either.Type<Error, Blob>> {
    try {
      let response;
      await fetch(...params)
        .then(async (res) => {
          response = res;
        })
        .catch(() => {
          throw new Error(
            "\nConnection to the server was either denied or blocked. \nPlease check server status.",
          );
        });

      if (response.ok) {
        const data = await response.blob();
        return Either.right(data);
      }
      return Either.left(
        await transformError(
          formatError(
            jsonParser.parse(await response.text()).message,
            response,
          ),
          response.status,
        ),
      );
    } catch (error) {
      return Either.left(
        await transformError(
          errorHasMessage(error) ? error.message : `Error: ${error}`,
          0,
        ),
      );
    }
  }

  /**
   * Executes a generic request and handles both successful and failed responses.
   * @template Data The type of data expected in the response.
   * @template Error The type of error expected.
   * @param transform A function to transform the response data.
   * @param transformError A function to transform error messages.
   * @param params Parameters for the fetch function.
   * @returns A promise resolving to an either type containing either the response data or an error message.
   */
  async function execute<Data, Error>(
    transform: (response: Response) => Promise<Data>,
    transformError: (message: string, status: number) => Promise<Error>,
    ...params: Parameters<typeof fetch>
  ): Promise<Either.Type<Error, Data>> {
    try {
      let response;
      await fetch(...params)
        .then(async (res) => {
          response = res;
        })
        .catch(() => {
          throw new Error(
            "\nConnection to the server was either denied or blocked. \nPlease check server status.",
          );
        });
      if (response.ok) {
        const data = await transform(response);
        return Either.right(data);
      }
      return Either.left(
        await transformError(
          formatError(
            jsonParser.parse(await response.text()).message,
            response,
          ),
          response.status,
        ),
      );
    } catch (error) {
      return Either.left(
        await transformError(
          errorHasMessage(error) ? error.message : `Error: ${error}`,
          0,
        ),
      );
    }
  }

  return {
    head,
    get,
    getWithoutEnvironment,
    getZipWithoutEnvironment,
    getWithHTTPCode,
    post,
    postWithoutResponse,
    postWithoutResponseAndEnvironment,
    patch,
    putWithoutEnvironment,
    delete: toDelete,
  };
};
