import { ApiHelper, RemoteData, StateHelper, Updater } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function HaltEnvironmentCommandManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelper<"GetEnvironmentDetails">,
  updater: Updater<"GetEnvironmentDetails">,
) {
  return CommandManagerWithEnv<"HaltEnvironment">(
    "HaltEnvironment",
    (command, environment) => {
      return async () => {
        stateHelper.set(RemoteData.loading(), {
          kind: "GetEnvironmentDetails",
          details: false,
          id: environment,
        });
        const result = await apiHelper.postWithoutResponse(
          `/api/v2/actions/environment/halt`,
          environment,
          null,
        );
        await updater.update({
          kind: "GetEnvironmentDetails",
          details: false,
          id: environment,
        });
        return result;
      };
    },
  );
}
