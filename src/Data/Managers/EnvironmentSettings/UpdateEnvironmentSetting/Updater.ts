import {
  ApiHelper,
  RemoteData,
  StateHelperWithEnv,
  UpdaterWithEnv,
} from "@/Core";
import { GetEnvironmentSetting } from "@/Data/Managers/EnvironmentSettings/GetEnvironmentSettingInterface";

export class EnvironmentSettingUpdater
  implements UpdaterWithEnv<"GetEnvironmentSetting">
{
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelperWithEnv<"GetEnvironmentSetting">
  ) {}

  async update(
    query: GetEnvironmentSetting,
    environment: string
  ): Promise<void> {
    return this.stateHelper.set(
      RemoteData.fromEither(
        await this.apiHelper.get(
          `/api/v2/environment_settings/${query.id}`,
          environment
        )
      ),
      query,
      environment
    );
  }
}
