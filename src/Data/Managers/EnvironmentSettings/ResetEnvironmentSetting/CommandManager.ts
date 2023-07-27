import { ApiHelper, Maybe, Updater, UpdaterWithEnv } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function ResetEnvironmentSettingCommandManager(
  apiHelper: ApiHelper,
  updater: UpdaterWithEnv<"GetEnvironmentSetting">,
  environmentUpdater: Updater<"GetEnvironmentDetails">,
) {
  return CommandManagerWithEnv<"ResetEnvironmentSetting">(
    "ResetEnvironmentSetting",
    (command, environment) => {
      return async (id) => {
        const error = await apiHelper.delete(
          `/api/v2/environment_settings/${id}`,
          environment,
        );
        if (Maybe.isNone(error)) {
          await updater.update(
            { kind: "GetEnvironmentSetting", id },
            environment,
          );
          await environmentUpdater.update({
            kind: "GetEnvironmentDetails",
            details: false,
            id: environment,
          });
        }
        return error;
      };
    },
  );
}
