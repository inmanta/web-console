import { ApiHelper, Fetcher, Either, Query } from "@/Core";

export class FetcherImpl<Kind extends Query.Kind> implements Fetcher<Kind> {
  constructor(private readonly baseApiHelper: ApiHelper) {}

  async getData(
    environment: string,
    url: string
  ): Promise<Either.Type<string, Query.ApiResponse<Kind>>> {
    return this.baseApiHelper.get(url, environment);
  }

  async getRootData(
    url: string
  ): Promise<Either.Type<string, Query.ApiResponse<Kind>>> {
    return this.baseApiHelper.getWithoutEnvironment(url);
  }
}
