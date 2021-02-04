import {
  Either,
  InstanceForResources,
  ResourceFetcher,
  ResourceModel,
} from "@/Core";

export class ResourceFetcherImpl implements ResourceFetcher {
  private getBaseUrl() {
    return process.env.API_BASEURL ? process.env.API_BASEURL : "";
  }

  private getResourcesUrl(entity: string, id: string, version: number) {
    return `${this.getBaseUrl()}/lsm/v1/service_inventory/${entity}/${id}/resources?current_version=${version}`;
  }

  async getResources({
    id,
    service_entity,
    environment,
    version,
  }: InstanceForResources): Promise<Either.Type<string, ResourceModel[]>> {
    const url = this.getResourcesUrl(service_entity, id, version);
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
