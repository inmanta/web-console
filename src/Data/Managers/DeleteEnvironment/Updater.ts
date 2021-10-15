import { Fetcher, Query, RemoteData, StateHelper, Updater } from "@/Core";
import { getUrl } from "@/Data/Managers/Projects/getUrl";

export class ProjectsUpdater implements Updater<"Projects"> {
  constructor(
    private readonly stateHelper: StateHelper<"Projects">,
    private readonly fetcher: Fetcher<"Projects">
  ) {}

  async update(query: Query.SubQuery<"Projects">): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.fetcher.getRootData(getUrl())),
      query
    );
  }
}
