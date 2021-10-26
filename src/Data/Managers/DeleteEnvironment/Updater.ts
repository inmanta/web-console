import { Fetcher, Query, RemoteData, StateHelper, Updater } from "@/Core";
import { getUrl } from "@/Data/Managers/Projects/getUrl";

export class ProjectsUpdater implements Updater<"GetProjects"> {
  constructor(
    private readonly stateHelper: StateHelper<"GetProjects">,
    private readonly fetcher: Fetcher<"GetProjects">
  ) {}

  async update(query: Query.SubQuery<"GetProjects">): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.fetcher.getRootData(getUrl())),
      query
    );
  }
}
