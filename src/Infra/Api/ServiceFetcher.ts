import { Fetcher, Either, ServiceModel, Query } from "@/Core";
import { BaseApiHelper } from "./BaseApiHelper";

export class ServiceFetcher implements Fetcher<"Service"> {
  constructor(private readonly baseApiHelper: BaseApiHelper) {}

  private getUrl(serviceName: string) {
    return `${this.baseApiHelper.getBaseUrl()}/lsm/v1/service_catalog/${serviceName}`;
  }

  async getData(
    query: Query.ServiceQuery
  ): Promise<Either.Type<string, ServiceModel>> {
    const { environment, name } = query.qualifier;
    return this.baseApiHelper.get(this.getUrl(name), environment);
  }
}
