import { StateHelper, Query, RemoteData, ApiHelper } from "@/Core";
import { PrimaryOneTimeQueryManager } from "@/Data/Managers/Helpers";
import { identity } from "lodash";
import { getUrl } from "./getUrl";

export class GetProjectsQueryManager extends PrimaryOneTimeQueryManager<"GetProjects"> {
  constructor(apiHelper: ApiHelper, stateHelper: StateHelper<"GetProjects">) {
    super(
      apiHelper,
      stateHelper,
      () => [],
      "GetProjects",
      getUrl,
      identity,
      ""
    );
  }

  async update(
    query: Query.SubQuery<"GetProjects">,
    url: string
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.apiHelper.getWithoutEnvironment(url)),
      query
    );
  }
}
