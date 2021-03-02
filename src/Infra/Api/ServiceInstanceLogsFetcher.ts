import { Fetcher, Either, Query } from "@/Core";
import { BaseApiHelper } from "./BaseApiHelper";

export class ServiceInstanceLogsFetcher implements Fetcher<"InstanceLogs"> {
  constructor(private readonly baseApiHelper: BaseApiHelper) {}

  private getUrl(serviceId: string, instanceId: string) {
    return `${this.baseApiHelper.getBaseUrl()}/lsm/v1/service_inventory/${serviceId}/${instanceId}/log`;
  }

  async getData({
    environment,
    id,
    service_entity,
  }: Query.Qualifier<"InstanceLogs">): Promise<
    Either.Type<Query.Error<"InstanceLogs">, Query.ApiResponse<"InstanceLogs">>
  > {
    return this.baseApiHelper.get(this.getUrl(service_entity, id), environment);
  }
}
