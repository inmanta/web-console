import { ApiHelper, Query, RemoteData, StateHelper, Updater } from "@/Core";
import { getUrl } from "@S/Settings/Data/GetProjects/getUrl";

export class ProjectsUpdater implements Updater<"GetProjects"> {
  constructor(
    private readonly stateHelper: StateHelper<"GetProjects">,
    private readonly apiHelper: ApiHelper
  ) {}

  async update(query: Query.SubQuery<"GetProjects">): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(
        await this.apiHelper.getWithoutEnvironment(
          getUrl(query.environmentDetails)
        )
      ),
      query
    );
  }
}
