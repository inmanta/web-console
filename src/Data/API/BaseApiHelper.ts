import Keycloak from "keycloak-js";
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
import { getCookie } from "../Common/CookieHelper";
import { BigIntJsonParser } from "./BigIntJsonParser";

/**
 * Helper class for making API calls.
 */
export class BaseApiHelper implements ApiHelper {
  jsonParser = new BigIntJsonParser();

  /**
   * Constructor for BaseApiHelper.
   * @param baseUrl Base URL for API requests. Defaults to "http://localhost:8888".
   * @param shouldAuthLocally Boolean indicating whether local authentication is required. Defaults to false.
   * @param keycloak Optional Keycloak instance for authentication.
   */
  constructor(
    private readonly baseUrl: string = "http://localhost:8888",
    private readonly shouldAuthLocally: boolean = false,
    private readonly keycloak?: Keycloak,
  ) {}

  /**
   * Makes a HEAD request to the specified URL.
   * @param url The URL to make the HEAD request to.
   * @returns A promise resolving to the HTTP status code of the response.
   */
  async head(url: string): Promise<number> {
    try {
      const response = await fetch(this.getFullUrl(url), {
        method: "HEAD",
        headers: this.getHeaders(),
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
  private getBearerToken(): { Authorization: string } | Record<string, never> {
    const { keycloak } = this;

    if (keycloak && keycloak.token) {
      return { Authorization: `Bearer ${keycloak.token}` };
    }

    const jwt = getCookie("inmanta_user");

    if (jwt) {
      return { Authorization: `Bearer ${jwt}` };
    }

    return {};
  }

  /**
   * Generates headers for API requests.
   * @param environment The environment for which headers are to be generated.
   * @returns Headers object including bearer token and environment information if provided.
   */

  private getHeaders(environment?: string): Record<string, string> {
    return {
      ...(environment ? { "X-Inmanta-Tid": environment } : {}),
      ...this.getBearerToken(),
    };
  }

  /**
   * Formats error messages for API requests. If the response status is 401 or 403, it will also handle the authorization flow.
   * @param message The error message.
   * @param response The response object.
   * @returns Formatted error message including status code and status text.
   */
  private formatError(message: string, response: Response): string {
    let errorMessage = message;
    if (response.status === 401 || response.status === 403) {
      errorMessage += ` ${words("error.authorizationFailed")}`;

      if (this.shouldAuthLocally && response.status === 401) {
        document.dispatchEvent(new CustomEvent("open-login"));
      } else if (this.keycloak) {
        if (response.status === 401) {
          this.keycloak.clearToken();
        }

        if (this.keycloak.isTokenExpired()) {
          this.keycloak.login();
        }
      }
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
  private errorHasMessage(error: unknown): error is { message: string } {
    if (!isObject(error)) return false;
    if (!objectHasKey(error, "message")) return false;
    return typeof error.message === "string";
  }

  /**
   * Executes a JSON request.
   * @param params Parameters for the fetch function.
   * @returns A promise resolving to an either type containing either the response data or an error message.
   */
  private async executeJson<Data>(
    ...params: Parameters<typeof fetch>
  ): Promise<Either.Type<string, Data>> {
    return this.execute<Data, string>(
      async (response) => this.jsonParser.parse(await response.text()),
      identity,
      ...params,
    );
  }

  /**
   * Executes a request without expecting a response.
   * @param params Parameters for the fetch function.
   * @returns A promise resolving to maybe a string if an error occurred, or none if request was successful.
   */
  private async executeWithoutResponse(
    ...params: Parameters<typeof fetch>
  ): Promise<Maybe.Type<string>> {
    const result = await this.execute<string, string>(
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
  private getFullUrl(url: string): string {
    return `${this.baseUrl}${url}`;
  }

  /**
   * Makes a GET request to the specified URL with an environment.
   * @param url The URL to make the GET request to.
   * @param environment The environment for which the request is made.
   * @returns A promise resolving to either the response data or an error message.
   */
  async get<Data>(
    url: string,
    environment: string,
  ): Promise<Either.Type<string, Data>> {
    return this.executeJson<Data>(this.getFullUrl(url), {
      headers: this.getHeaders(environment),
    });
  }

  /**
   * Makes a GET request to the specified URL without specifying an environment.
   * @param url The URL to make the GET request to.
   * @returns A promise resolving to either the response data or an error message.
   */
  async getWithoutEnvironment<Data>(
    url: string,
  ): Promise<Either.Type<string, Data>> {
    return this.executeJson<Data>(this.getFullUrl(url), {
      headers: this.getHeaders(),
    });
  }

  /**
   * Makes a GET request to the specified URL without specifying an environment, expecting a blob response.
   * @param url The URL to make the GET request to.
   * @returns A promise resolving to either the response data or an error message.
   */
  async getZipWithoutEnvironment<Blob>(
    url: string,
  ): Promise<Either.Type<string, Blob>> {
    return this.executeBlob<Blob, string>(identity, this.getFullUrl(url), {
      headers: this.getHeaders(),
    });
  }

  /**
   * Makes a POST request to the specified URL with specified environment and request body.
   * @param url The URL to make the POST request to.
   * @param environment The environment for which the request is made.
   * @param body The request body.
   * @returns A promise resolving to either the response data or an error message.
   */
  async post<Data, Body>(
    url: string,
    environment: string,
    body: Body,
  ): Promise<Either.Type<string, Data>> {
    return this.executeJson<Data>(this.getFullUrl(url), {
      headers: {
        "Content-Type": "application/json",
        ...this.getHeaders(environment),
      },
      method: "POST",
      body: this.jsonParser.stringify(body),
    });
  }

  /**
   * Makes a POST request to the specified URL without expecting a response.
   * @param url The URL to make the POST request to.
   * @param environment The environment for which the request is made.
   * @param body The request body.
   * @returns A promise resolving to maybe a string if an error occurred, or none if request was successful.
   */
  async postWithoutResponse<Body>(
    url: string,
    environment: string,
    body: Body,
  ): Promise<Maybe.Type<string>> {
    return this.executeWithoutResponse(this.getFullUrl(url), {
      headers: {
        "Content-Type": "application/json",
        ...this.getHeaders(environment),
      },
      method: "POST",
      body: this.jsonParser.stringify(body),
    });
  }

  /**
   * Makes a POST request to the specified URL without specifying an environment.
   * @param url The URL to make the POST request to.
   * @param body The request body.
   * @returns A promise resolving to maybe a string if an error occurred, or none if request was successful.
   */
  async postWithoutResponseAndEnvironment<Body>(
    url: string,
    body: Body,
  ): Promise<Maybe.Type<string>> {
    return this.executeWithoutResponse(this.getFullUrl(url), {
      headers: {
        "Content-Type": "application/json",
        ...this.getHeaders(),
      },
      method: "POST",
      body: this.jsonParser.stringify(body),
    });
  }

  /**
   * Makes a PUT request to the specified URL without specifying an environment.
   * @param url The URL to make the PUT request to.
   * @param body The request body.
   * @returns A promise resolving to either the response data or an error message.
   */
  putWithoutEnvironment<Data, Body>(
    url: string,
    body: Body,
  ): Promise<Either.Type<string, Data>> {
    return this.executeJson(this.getFullUrl(url), {
      headers: {
        "Content-Type": "application/json",
        ...this.getHeaders(),
      },
      method: "PUT",
      body: this.jsonParser.stringify(body),
    });
  }

  /**
   * Makes a PATCH request to the specified URL with specified environment and request body.
   * @param url The URL to make the PATCH request to.
   * @param environment The environment for which the request is made.
   * @param body The request body.
   * @returns A promise resolving to maybe a string if an error occurred, or none if request was successful.
   */
  async patch<Body>(
    url: string,
    environment: string,
    body: Body,
  ): Promise<Maybe.Type<string>> {
    return this.executeWithoutResponse(this.getFullUrl(url), {
      headers: {
        "Content-Type": "application/json",
        ...this.getHeaders(environment),
      },
      method: "PATCH",
      body: this.jsonParser.stringify(body),
    });
  }

  /**
   * Makes a DELETE request to the specified URL with specified environment.
   * @param url The URL to make the DELETE request to.
   * @param environment The environment for which the request is made.
   * @returns A promise resolving to maybe a string if an error occurred, or none if request was successful.
   */
  async delete(url: string, environment: string): Promise<Maybe.Type<string>> {
    return this.executeWithoutResponse(this.getFullUrl(url), {
      headers: {
        "Content-Type": "application/json",
        ...this.getHeaders(environment),
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
  getWithHTTPCode<Data>(
    url: string,
    environment: string,
  ): Promise<Either.Type<ErrorWithHTTPCode, Data>> {
    return this.execute<Data, ErrorWithHTTPCode>(
      async (response) => this.jsonParser.parse(await response.text()),
      async (message, status) => ({ message, status }),
      this.getFullUrl(url),
      { headers: this.getHeaders(environment) },
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
  private async executeBlob<Blob, Error>(
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
          this.formatError(
            this.jsonParser.parse(await response.text()).message,
            response,
          ),
          response.status,
        ),
      );
    } catch (error) {
      return Either.left(
        await transformError(
          this.errorHasMessage(error) ? error.message : `Error: ${error}`,
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
  private async execute<Data, Error>(
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
          this.formatError(
            this.jsonParser.parse(await response.text()).message,
            response,
          ),
          response.status,
        ),
      );
    } catch (error) {
      return Either.left(
        await transformError(
          this.errorHasMessage(error) ? error.message : `Error: ${error}`,
          0,
        ),
      );
    }
  }
}
