import { ApiHelper, Either } from "@/Core";
import { words } from "@/UI/words";
import { KeycloakInstance } from "keycloak-js";

export class BaseApiHelper implements ApiHelper {
  constructor(
    private readonly baseUrl: string = "",
    private readonly keycloak?: KeycloakInstance
  ) {}

  getBaseUrl(): string {
    return this.baseUrl;
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
    let errorMessage = message.replace(/\n/g, " ");

    if (this.keycloak && (response.status === 401 || response.status === 403)) {
      errorMessage += ` ${words("error.authorizationFailed")}`;
      this.keycloak.clearToken();
    }

    return words("error.server.intro")(
      `${response.status} ${response.statusText} ${
        errorMessage ? JSON.stringify(errorMessage) : ""
      }`
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
        this.formatError((await response.json()).message, response)
      );
    } catch (error) {
      if (error.message) return Either.left(error.message);
      return Either.left(`Error: ${error}`);
    }
  }

  private async executeJson<Data>(
    ...params: Parameters<typeof fetch>
  ): Promise<Either.Type<string, Data>> {
    return this.execute<Data>((response) => response.json(), ...params);
  }

  private async executeEmptyResponse(
    ...params: Parameters<typeof fetch>
  ): Promise<Either.Type<string, string>> {
    return this.execute((response) => response.text(), ...params);
  }

  async get<Data>(
    url: string,
    environment: string
  ): Promise<Either.Type<string, Data>> {
    return this.executeJson<Data>(url, {
      headers: this.getHeaders(environment),
    });
  }

  async getWithoutEnvironment<Data>(
    url: string
  ): Promise<Either.Type<string, Data>> {
    return this.executeJson<Data>(url, {
      headers: this.getHeaders(),
    });
  }

  async post<Data, Body>(
    url: string,
    environment: string,
    body: Body
  ): Promise<Either.Type<string, Data>> {
    return this.executeJson<Data>(url, {
      headers: {
        "Content-Type": "application/json",
        ...this.getHeaders(environment),
      },
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async postEmptyResponse<Body>(
    url: string,
    environment: string,
    body: Body
  ): Promise<Either.Type<string, string>> {
    return this.executeEmptyResponse(url, {
      headers: {
        "Content-Type": "application/json",
        ...this.getHeaders(environment),
      },
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async patch<Body>(
    url: string,
    environment: string,
    body: Body
  ): Promise<Either.Type<string, string>> {
    return this.executeEmptyResponse(url, {
      headers: {
        "Content-Type": "application/json",
        ...this.getHeaders(environment),
      },
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async delete(
    url: string,
    environment: string
  ): Promise<Either.Type<string, string>> {
    return this.executeEmptyResponse(url, {
      headers: {
        "Content-Type": "application/json",
        ...this.getHeaders(environment),
      },
      method: "DELETE",
    });
  }
}
