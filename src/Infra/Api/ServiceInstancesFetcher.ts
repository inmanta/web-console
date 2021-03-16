import { Fetcher, Either, Query } from "@/Core";
import { BaseApiHelper } from "./BaseApiHelper";

export class ServiceInstancesFetcher implements Fetcher<"ServiceInstances"> {
  constructor(private readonly baseApiHelper: BaseApiHelper) {}

  private getUrl(serviceName: string) {
    return `${this.baseApiHelper.getBaseUrl()}/lsm/v1/service_inventory/${serviceName}?include_deployment_progress=True`;
  }

  async getData({
    environment,
    name,
  }: Query.Qualifier<"ServiceInstances">): Promise<
    Either.Type<string, Query.ApiResponse<"ServiceInstances">>
  > {
    return this.baseApiHelper.get(this.getUrl(name), environment);
  }
}
