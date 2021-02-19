import { Fetcher, Either, ServiceInstanceModel, Query } from "@/Core";
import { BaseApiHelper } from "./BaseApiHelper";

export class ServiceInstancesFetcher implements Fetcher<"ServiceInstances"> {
  constructor(private readonly baseApiHelper: BaseApiHelper) {}

  private getUrl(serviceName: string) {
    return `${this.baseApiHelper.getBaseUrl()}/lsm/v1/service_inventory/${serviceName}?include_deployment_progress=True`;
  }

  async getData(
    query: Query.ServiceInstancesQuery
  ): Promise<Either.Type<string, ServiceInstanceModel[]>> {
    const { environment, name } = query.qualifier;
    return this.baseApiHelper.get(this.getUrl(name), environment);
  }
}
