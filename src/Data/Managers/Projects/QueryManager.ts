import { Fetcher, StateHelper, Query, RemoteData } from "@/Core";
import { OneTimeQueryManagerImpl } from "@/Data/Common";
import { identity } from "lodash";
import { getUrl } from "./getUrl";

export class ProjectsQueryManager extends OneTimeQueryManagerImpl<"Projects"> {
  constructor(
    fetcher: Fetcher<"Projects">,
    stateHelper: StateHelper<"Projects">
  ) {
    super(fetcher, stateHelper, () => [], "Projects", getUrl, identity, "");
  }

  async update(query: Query.SubQuery<"Projects">, url: string): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.fetcher.getRootData(url)),
      query
    );
  }
}
