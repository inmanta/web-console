import { StateHelper, Query, RemoteData, ApiHelper } from "@/Core";
import { PrimaryOneTimeQueryManager } from "@/Data/Managers/Helpers";
import { identity } from "lodash";

export class GetServerStatusQueryManager extends PrimaryOneTimeQueryManager<"GetServerStatus"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetServerStatus">
  ) {
    super(
      apiHelper,
      stateHelper,
      () => [],
      "GetServerStatus",
      () => `/api/v1/serverstatus`,
      identity,
      ""
    );
  }

  async update(
    query: Query.SubQuery<"GetServerStatus">,
    url: string
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.apiHelper.getWithoutEnvironment(url)),
      query
    );
  }
}
