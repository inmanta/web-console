import { ApiHelper, Maybe, Updater, UpdaterWithEnv } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function UpdateEnvironmentSettingCommandManager(
  apiHelper: ApiHelper,
  updater: UpdaterWithEnv<"GetEnvironmentSetting">,
  environmentUpdater: Updater<"GetEnvironmentDetails">
) {
  return CommandManagerWithEnv<"UpdateEnvironmentSetting">(
    "UpdateEnvironmentSetting",
    (command, environment) => {
      return async (id, value) => {
        const error = await apiHelper.postWithoutResponse(
          `/api/v2/environment_settings/${id}`,
          environment,
          { value }
        );

        if (Maybe.isNone(error)) {
          await updater.update(
            { kind: "GetEnvironmentSetting", id },
            environment
          );
          await environmentUpdater.update({
            kind: "GetEnvironmentDetails",
            details: false,
            id: environment,
          });
          document.dispatchEvent(new Event("Settings update"));
        }

        return error;
      };
    }
  );
}
