import { ApiHelper, Either, ResourceModel, Subject } from "@/Core";
import { words } from "@/UI/words";
import { KeycloakInstance } from "keycloak-js";

export class ResourceFetcherImpl
  implements ApiHelper<Subject, string, ResourceModel[]> {
  constructor(private readonly keycloak: KeycloakInstance | undefined) {}

  private getBaseUrl() {
    return process.env.API_BASEURL ? process.env.API_BASEURL : "";
  }

  private getResourcesUrl(entity: string, id: string, version: number) {
    return `${this.getBaseUrl()}/lsm/v1/service_inventory/${entity}/${id}/resources?current_version=${version}`;
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

  async getData(
    subject: Subject
  ): Promise<Either.Type<string, ResourceModel[]>> {
    try {
      const { id, version, environment, service_entity } = subject.query;
      const response = await fetch(
        this.getResourcesUrl(service_entity, id, version),
        { headers: this.getHeaders(environment) }
      );
      if (response.ok) {
        const data = await response.json();
        return Either.right(data.data);
      }
      return Either.left(this.formatError(await response.json(), response));
    } catch (error) {
      if (error.message) return Either.left(error.message);
      return Either.left(`Error: ${error}`);
    }
  }
}
