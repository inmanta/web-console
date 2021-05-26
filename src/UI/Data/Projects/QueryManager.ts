import { Fetcher, StateHelper, Query, RemoteData } from "@/Core";
import { OneTimeQueryManagerImpl } from "@/UI/Data/QueryManagerImpl";
import { identity } from "lodash";

export class ProjectsQueryManager extends OneTimeQueryManagerImpl<"Projects"> {
  constructor(
    fetcher: Fetcher<"Projects">,
    stateHelper: StateHelper<"Projects">
  ) {
    super(
      fetcher,
      stateHelper,
      () => [],
      "Projects",
      () => `/api/v2/project`,
      identity,
      ""
    );
  }

  async update(query: Query.SubQuery<"Projects">, url: string): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.fetcher.getRootData(url)),
      query.qualifier
    );
  }
}
