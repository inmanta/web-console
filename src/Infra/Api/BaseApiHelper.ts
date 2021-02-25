import { ApiHelper, Either } from "@/Core";
import { words } from "@/UI/words";
import { KeycloakInstance } from "keycloak-js";

export class BaseApiHelper implements ApiHelper {
  constructor(private readonly keycloak: KeycloakInstance | undefined) {}

  getBaseUrl(): string {
    return process.env.API_BASEURL ? process.env.API_BASEURL : "";
  }

  private getHeaders(environment: string): Record<string, string> {
    const { keycloak } = this;
    return {
      "X-Inmanta-Tid": environment,
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

  async get<T>(
    url: string,
    environment: string
  ): Promise<Either.Type<string, T>> {
    try {
      const response = await fetch(url, {
        headers: this.getHeaders(environment),
      });
      if (response.ok) {
        const data = await response.json();
        return Either.right(data.data);
      }
      return Either.left(
        this.formatError((await response.json()).message, response)
      );
    } catch (error) {
      if (error.message) return Either.left(error.message);
      return Either.left(`Error: ${error}`);
    }
  }
}
