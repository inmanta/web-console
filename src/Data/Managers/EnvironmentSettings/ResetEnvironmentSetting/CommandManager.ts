import { ApiHelper, Maybe, UpdaterWithEnv } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export class ResetEnvironmentSettingCommandManager extends CommandManagerWithEnv<"ResetEnvironmentSetting"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: UpdaterWithEnv<"GetEnvironmentSetting">,
    private readonly environmentUpdater: UpdaterWithEnv<"GetEnvironmentDetails">
  ) {
    super("ResetEnvironmentSetting", (command, environment) => {
      return async (id) => {
        const error = await this.apiHelper.delete(
          `/api/v2/environment_settings/${id}`,
          environment
        );
        if (Maybe.isNone(error)) {
          await this.updater.update(
            { kind: "GetEnvironmentSetting", id },
            environment
          );
          await this.environmentUpdater.update(
            { kind: "GetEnvironmentDetails", details: false, id: environment },
            environment
          );
        }
        return error;
      };
    });
  }
}
