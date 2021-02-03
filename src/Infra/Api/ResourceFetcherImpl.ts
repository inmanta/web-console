import { Either, ResourceFetcher } from "@/Core";

export class ResourceFetcherImpl implements ResourceFetcher {
  private getBaseUrl() {
    return process.env.API_BASEURL ? process.env.API_BASEURL : "";
  }

  private getResourcesUrl(entity: string, id: string, version: string) {
    return `${this.getBaseUrl()}/lsm/v1/service_inventory/${entity}/${id}/resources?current_version=${version}`;
  }

  async getResources(
    id: string,
    entity: string,
    version: string,
    environment: string
  ): Promise<Either.Type<string, unknown>> {
    const url = this.getResourcesUrl(entity, id, version);
    const headers = { "X-Inmanta-Tid": environment };

    try {
      const result = await fetch(`${url}`, { headers });
      const data = await result.json();
      return Either.right(data.data);
    } catch (e) {
      return Either.left(e);
    }
  }
}
