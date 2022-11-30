import { ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function CommandManager(apiHelper: ApiHelper) {
  return CommandManagerWithEnv<"TriggerDryRun">(
    "TriggerDryRun",
    ({ version }, environment) =>
      () =>
        apiHelper.postWithoutResponse(
          `/api/v2/dryrun/${version}`,
          environment,
          undefined
        )
  );
}
