import { ApiHelper, Query, RemoteData, StateHelper, Updater } from "@/Core";

export class EnvironmentSettingUpdater
  implements Updater<"GetEnvironmentSetting">
{
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelper<"GetEnvironmentSetting">,
    private readonly environment: string
  ) {}

  async update(query: Query.SubQuery<"GetEnvironmentSetting">): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(
        await this.apiHelper.get(
          `/api/v2/environment_settings/${query.id}`,
          this.environment
        )
      ),
      query
    );
  }
}
