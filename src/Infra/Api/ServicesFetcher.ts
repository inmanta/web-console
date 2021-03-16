import { Fetcher, Either, Query } from "@/Core";
import { BaseApiHelper } from "./BaseApiHelper";

export class ServicesFetcher implements Fetcher<"Services"> {
  constructor(private readonly baseApiHelper: BaseApiHelper) {}

  private getUrl() {
    return `${this.baseApiHelper.getBaseUrl()}/lsm/v1/service_catalog`;
  }

  async getData({
    id,
  }: Query.Qualifier<"Services">): Promise<
    Either.Type<string, Query.ApiResponse<"Services">>
  > {
    return this.baseApiHelper.get(this.getUrl(), id);
  }
}
