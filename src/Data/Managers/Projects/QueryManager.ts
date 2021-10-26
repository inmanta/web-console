import { Fetcher, StateHelper, Query, RemoteData } from "@/Core";
import { OneTimeQueryManagerImpl } from "@/Data/Common";
import { identity } from "lodash";
import { getUrl } from "./getUrl";

export class ProjectsQueryManager extends OneTimeQueryManagerImpl<"GetProjects"> {
  constructor(
    fetcher: Fetcher<"GetProjects">,
    stateHelper: StateHelper<"GetProjects">
  ) {
    super(fetcher, stateHelper, () => [], "GetProjects", getUrl, identity, "");
  }

  async update(
    query: Query.SubQuery<"GetProjects">,
    url: string
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.fetcher.getRootData(url)),
      query
    );
  }
}
