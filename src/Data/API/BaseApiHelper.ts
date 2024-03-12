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

export class BaseApiHelper implements ApiHelper {
  jsonParser = new BigIntJsonParser();
  constructor(
    private readonly baseUrl: string = "",
    private readonly shouldAuthLocally: boolean = false,
    private readonly keycloak?: Keycloak,
  ) {}

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

  private getHeaders(environment?: string): Record<string, string> {
    const { keycloak } = this;
    const jwt = getCookie("inmanta_user");
    let Authorization;
    if (keycloak && keycloak.token) {
      Authorization = `Bearer ${keycloak.token}`;
    } else if (jwt) {
      Authorization = `Bearer ${jwt}`;
    }
    return {
      ...(environment ? { "X-Inmanta-Tid": environment } : {}),
      ...(Authorization ? { Authorization } : {}),
    };
  }

  private formatError(message: string, response: Response): string {
    let errorMessage = message;
    if (response.status === 401 || response.status === 403) {
      errorMessage += ` ${words("error.authorizationFailed")}`;

      if (this.keycloak) {
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

  private errorHasMessage(error: unknown): error is { message: string } {
    if (!isObject(error)) return false;
    if (!objectHasKey(error, "message")) return false;
    return typeof error.message === "string";
  }

  private async executeJson<Data>(
    ...params: Parameters<typeof fetch>
  ): Promise<Either.Type<string, Data>> {
    return this.execute<Data, string>(
      async (response) => this.jsonParser.parse(await response.text()),
      identity,
      ...params,
    );
  }

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

  private getFullUrl(url: string): string {
    return `${this.baseUrl}${url}`;
  }

  async get<Data>(
    url: string,
    environment: string,
  ): Promise<Either.Type<string, Data>> {
    return this.executeJson<Data>(this.getFullUrl(url), {
      headers: this.getHeaders(environment),
    });
  }

  async getWithoutEnvironment<Data>(
    url: string,
  ): Promise<Either.Type<string, Data>> {
    return this.executeJson<Data>(this.getFullUrl(url), {
      headers: this.getHeaders(),
    });
  }

  async getZipWithoutEnvironment<Blob>(
    url: string,
  ): Promise<Either.Type<string, Blob>> {
    return this.executeBlob<Blob, string>(identity, this.getFullUrl(url), {
      headers: this.getHeaders(),
    });
  }

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

  async delete(url: string, environment: string): Promise<Maybe.Type<string>> {
    return this.executeWithoutResponse(this.getFullUrl(url), {
      headers: {
        "Content-Type": "application/json",
        ...this.getHeaders(environment),
      },
      method: "DELETE",
    });
  }

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
