import { RemoteData, StateHelper, ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function ServiceConfigCommandManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelper<"GetServiceConfig">,
) {
  return CommandManagerWithEnv<"UpdateServiceConfig">(
    "UpdateServiceConfig",
    (command, environment) => async (option, value) => {
      const configData = stateHelper.getOnce({
        ...command,
        kind: "GetServiceConfig",
      });
      if (!RemoteData.isSuccess(configData)) return;

      stateHelper.set(
        RemoteData.fromEither(
          await apiHelper.post(
            `/lsm/v1/service_catalog/${command.name}/config`,
            environment,
            {
              values: {
                ...configData.value,
                [option]: value,
              },
            },
          ),
        ),
        { ...command, kind: "GetServiceConfig" },
      );
    },
  );
}
