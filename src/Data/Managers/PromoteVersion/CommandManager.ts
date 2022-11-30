import { ApiHelper, UpdaterWithEnv } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function PromoteVersionCommandManager(
  apiHelper: ApiHelper,
  updater: UpdaterWithEnv<"GetDesiredStates">
) {
  return CommandManagerWithEnv<"PromoteVersion">(
    "PromoteVersion",
    ({ version }, environment) =>
      async (query) => {
        const result = await apiHelper.postWithoutResponse(
          `/api/v2/desiredstate/${version}/promote`,
          environment,
          null
        );
        await updater.update(query, environment);
        return result;
      }
  );
}
