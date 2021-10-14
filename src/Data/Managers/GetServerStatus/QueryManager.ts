import { Fetcher, StateHelper, Query, RemoteData } from "@/Core";
import { OneTimeQueryManagerImpl } from "@/Data/Common";
import { identity } from "lodash";

export class GetServerStatusQueryManager extends OneTimeQueryManagerImpl<"GetServerStatus"> {
  constructor(
    fetcher: Fetcher<"GetServerStatus">,
    stateHelper: StateHelper<"GetServerStatus">
  ) {
    super(
      fetcher,
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
      RemoteData.fromEither(await this.fetcher.getRootData(url)),
      query
    );
  }
}
