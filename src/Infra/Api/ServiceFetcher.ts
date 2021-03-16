import { Fetcher, Either, Query } from "@/Core";
import { BaseApiHelper } from "./BaseApiHelper";

export class ServiceFetcher implements Fetcher<"Service"> {
  constructor(private readonly baseApiHelper: BaseApiHelper) {}

  private getUrl(serviceName: string) {
    return `${this.baseApiHelper.getBaseUrl()}/lsm/v1/service_catalog/${serviceName}`;
  }

  async getData({
    environment,
    name,
  }: Query.Qualifier<"Service">): Promise<
    Either.Type<string, Query.ApiResponse<"Service">>
  > {
    return this.baseApiHelper.get(this.getUrl(name), environment);
  }
}
