import { Fetcher, Either, Query } from "@/Core";
import { BaseApiHelper } from "./BaseApiHelper";

export class ResourcesFetcher implements Fetcher<"Resources"> {
  constructor(private readonly baseApiHelper: BaseApiHelper) {}

  private getUrl(entity: string, id: string, version: number) {
    return `${this.baseApiHelper.getBaseUrl()}/lsm/v1/service_inventory/${entity}/${id}/resources?current_version=${version}`;
  }

  async getData(
    qualifier: Query.Qualifier<"Resources">
  ): Promise<Either.Type<string, Query.ApiResponse<"Resources">>> {
    const { id, version, environment, service_entity } = qualifier;
    return this.baseApiHelper.get(
      this.getUrl(service_entity, id, version),
      environment
    );
  }
}
