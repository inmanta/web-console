import { ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function TriggerCompileCommandManager(apiHelper: ApiHelper) {
  return CommandManagerWithEnv<"TriggerCompile">(
    "TriggerCompile",
    (command, environment) => (update) =>
      apiHelper.postWithoutResponseAndEnvironment(
        `/api/v1/notify/${environment}`,
        {
          update,
          metadata: {
            type: "console",
            message: "Compile triggered from the console",
          },
        },
      ),
  );
}
