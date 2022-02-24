import { ApiHelper, Maybe, Updater, UpdaterWithEnv } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export class UpdateEnvironmentSettingCommandManager extends CommandManagerWithEnv<"UpdateEnvironmentSetting"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: UpdaterWithEnv<"GetEnvironmentSetting">,
    private readonly environmentUpdater: Updater<"GetEnvironmentDetails">
  ) {
    super("UpdateEnvironmentSetting", (command, environment) => {
      return async (id, value) => {
        const error = await this.apiHelper.postWithoutResponse(
          `/api/v2/environment_settings/${id}`,
          environment,
          { value }
        );

        if (Maybe.isNone(error)) {
          await this.updater.update(
            { kind: "GetEnvironmentSetting", id },
            environment
          );
          await this.environmentUpdater.update({
            kind: "GetEnvironmentDetails",
            details: false,
            id: environment,
          });
        }

        return error;
      };
    });
  }
}
