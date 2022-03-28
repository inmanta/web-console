import { ApiHelper, Query, RemoteData, StateHelper, Updater } from "@/Core";
import { getUrl } from "@S/Settings/Data/GetProjects/getUrl";

export class EnvironmentsUpdater implements Updater<"GetEnvironments"> {
  constructor(
    private readonly stateHelper: StateHelper<"GetEnvironments">,
    private readonly apiHelper: ApiHelper
  ) {}

  async update(query: Query.SubQuery<"GetEnvironments">): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(
        await this.apiHelper.getWithoutEnvironment(getUrl(query.details))
      ),
      query
    );
  }
}
