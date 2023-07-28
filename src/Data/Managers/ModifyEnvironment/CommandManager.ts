import { ModifyEnvironmentParams, ApiHelper, Updater } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function ModifyEnvironmentCommandManager(
  apiHelper: ApiHelper,
  updater: Updater<"GetEnvironmentDetails">,
  listUpdater: Updater<"GetEnvironments">,
) {
  return CommandManagerWithEnv<"ModifyEnvironment">(
    "ModifyEnvironment",
    (command, environment) => async (body: ModifyEnvironmentParams) => {
      const error = await apiHelper.postWithoutResponseAndEnvironment(
        `/api/v2/environment/${environment}`,
        body,
      );
      await updater.update({
        kind: "GetEnvironmentDetails",
        details: true,
        id: environment,
      });
      await listUpdater.update({
        kind: "GetEnvironments",
        details: true,
      });
      return error;
    },
  );
}
