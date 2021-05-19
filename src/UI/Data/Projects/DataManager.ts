import { Fetcher, StateHelper, Query, RemoteData } from "@/Core";
import { OneTimeDataManagerImpl } from "../DataManagerImpl";
import { identity } from "lodash";

export class ProjectsDataManager extends OneTimeDataManagerImpl<"Projects"> {
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

  async update(
    qualifier: Query.Qualifier<"Projects">,
    url: string
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.fetcher.getRootData(url)),
      qualifier
    );
  }
}
