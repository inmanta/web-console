import { StateHelper, Query, RemoteData, ApiHelper } from "@/Core";
import { PrimaryOneTimeQueryManager } from "@/Data/Managers/Helpers";
import { identity } from "lodash";
import { getUrl } from "./getUrl";

export class GetEnvironmentsQueryManager extends PrimaryOneTimeQueryManager<"GetEnvironments"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetEnvironments">
  ) {
    super(
      apiHelper,
      stateHelper,
      () => [],
      "GetEnvironments",
      getUrl,
      identity,
      ""
    );
  }

  async update(
    query: Query.SubQuery<"GetEnvironments">,
    url: string
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.apiHelper.getWithoutEnvironment(url)),
      query
    );
  }
}
