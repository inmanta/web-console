import {
  Either,
  InstanceForResources,
  ResourceFetcher,
  ResourceModel,
} from "@/Core";
import { KeycloakInstance } from "keycloak-js";

export class ResourceFetcherImpl implements ResourceFetcher {
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

  async getResources({
    id,
    service_entity,
    environment,
    version,
  }: InstanceForResources): Promise<Either.Type<string, ResourceModel[]>> {
    try {
      const result = await fetch(
        this.getResourcesUrl(service_entity, id, version),
        { headers: this.getHeaders(environment) }
      );
      const data = await result.json();
      return Either.right(data.data);
    } catch (error) {
      if (error.message) return Either.left(error.message);
      return Either.left(`Error: ${error}`);
    }
  }
}
