import { ApiHelper, Query, RemoteData, StateHelper, Updater } from "@/Core";
import { getUrl } from "@S/Settings/Data/GetProjects/getUrl";

export class EnvironmentsUpdater
  implements Updater<"GetEnvironmentsContinuous">
{
  constructor(
    private readonly stateHelper: StateHelper<"GetEnvironmentsContinuous">,
    private readonly apiHelper: ApiHelper,
  ) {}

  async update(
    query: Query.SubQuery<"GetEnvironmentsContinuous">,
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(
        await this.apiHelper.getWithoutEnvironment(getUrl(query.details)),
      ),
      query,
    );
  }
}
