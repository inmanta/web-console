import { KeycloakInstance } from "keycloak-js";
import {
  ApiHelper,
  Either,
  Maybe,
  objectHasKey,
  isObject,
  JsonParser,
} from "@/Core";
import { words } from "@/UI/words";
import { BigIntJsonParser } from "./BigIntJsonParser";

export class BaseApiHelper implements ApiHelper {
  constructor(
    private readonly jsonParser: JsonParser = new BigIntJsonParser(),
    private readonly baseUrl: string = "",
    private readonly keycloak?: KeycloakInstance
  ) {}

  async head(url: string): Promise<number> {
    try {
      const response = await fetch(this.getFullUrl(url), { method: "HEAD" });
      return response.status;
    } catch (error) {
      return 500;
    }
  }

  private getHeaders(environment?: string): Record<string, string> {
    const { keycloak } = this;
    return {
      ...(environment ? { "X-Inmanta-Tid": environment } : {}),
      ...(keycloak && keycloak.token
        ? { Authorization: `Bearer ${keycloak.token}` }
        : {}),
    };
  }

  private formatError(message: string, response: Response): string {
    let errorMessage = message;

    if (this.keycloak && (response.status === 401 || response.status === 403)) {
      errorMessage += ` ${words("error.authorizationFailed")}`;
      this.keycloak.clearToken();
    }

    return words("error.server.intro")(
      `${response.status} ${response.statusText} \n${errorMessage}`
    );
  }

  private async execute<Data>(
    transform: (response: Response) => Promise<Data>,
    ...params: Parameters<typeof fetch>
  ): Promise<Either.Type<string, Data>> {
    try {
      const response = await fetch(...params);
      if (response.ok) {
        const data = await transform(response);
        return Either.right(data);
      }
      return Either.left(
        this.formatError(
          this.jsonParser.parse(await response.text()).message,
          response
        )
      );
    } catch (error) {
      if (this.errorHasMessage(error)) return Either.left(error.message);
      return Either.left(`Error: ${error}`);
    }
  }

  private errorHasMessage(error: unknown): error is { message: string } {
    if (!isObject(error)) return false;
    if (!objectHasKey(error, "message")) return false;
    return typeof error.message === "string";
  }

  private async executeJson<Data>(
    ...params: Parameters<typeof fetch>
  ): Promise<Either.Type<string, Data>> {
    return this.execute<Data>(
      async (response) => this.jsonParser.parse(await response.text()),
      ...params
    );
  }

  private async executeWithoutResponse(
    ...params: Parameters<typeof fetch>
  ): Promise<Maybe.Type<string>> {
    const result = await this.execute((response) => response.text(), ...params);
    return Either.isLeft(result) ? Maybe.some(result.value) : Maybe.none();
  }

  private getFullUrl(url: string): string {
    return `${this.baseUrl}${url}`;
  }

  async get<Data>(
    url: string,
    environment: string
  ): Promise<Either.Type<string, Data>> {
    return this.executeJson<Data>(this.getFullUrl(url), {
      headers: this.getHeaders(environment),
    });
  }

  async getWithoutEnvironment<Data>(
    url: string
  ): Promise<Either.Type<string, Data>> {
    return this.executeJson<Data>(this.getFullUrl(url), {
      headers: this.getHeaders(),
    });
  }

  async post<Data, Body>(
    url: string,
    environment: string,
    body: Body
  ): Promise<Either.Type<string, Data>> {
    return this.executeJson<Data>(this.getFullUrl(url), {
      headers: {
        "Content-Type": "application/json",
        ...this.getHeaders(environment),
      },
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async postWithoutResponse<Body>(
    url: string,
    environment: string,
    body: Body
  ): Promise<Maybe.Type<string>> {
    return this.executeWithoutResponse(this.getFullUrl(url), {
      headers: {
        "Content-Type": "application/json",
        ...this.getHeaders(environment),
      },
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async postWithoutResponseAndEnvironment<Body>(
    url: string,
    body: Body
  ): Promise<Maybe.Type<string>> {
    return this.executeWithoutResponse(this.getFullUrl(url), {
      headers: {
        "Content-Type": "application/json",
        ...this.getHeaders(),
      },
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  putWithoutResponseAndEnvironment<Body>(
    url: string,
    body: Body
  ): Promise<Maybe.Type<string>> {
    return this.executeWithoutResponse(this.getFullUrl(url), {
      headers: {
        "Content-Type": "application/json",
        ...this.getHeaders(),
      },
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async patch<Body>(
    url: string,
    environment: string,
    body: Body
  ): Promise<Maybe.Type<string>> {
    return this.executeWithoutResponse(this.getFullUrl(url), {
      headers: {
        "Content-Type": "application/json",
        ...this.getHeaders(environment),
      },
      method: "PATCH",
      body: JSON.stringify(body),
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
}
