import { RemoteData, StateHelper, ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export class ServiceConfigCommandManager extends CommandManagerWithEnv<"UpdateServiceConfig"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelper<"GetServiceConfig">
  ) {
    super(
      "UpdateServiceConfig",
      (command, environment) => async (option, value) => {
        const configData = this.stateHelper.getOnce({
          ...command,
          kind: "GetServiceConfig",
        });
        if (!RemoteData.isSuccess(configData)) return;
        this.stateHelper.set(
          RemoteData.fromEither(
            await this.apiHelper.post(
              `/lsm/v1/service_catalog/${command.name}/config`,
              environment,
              {
                values: {
                  ...configData.value,
                  [option]: value,
                },
              }
            )
          ),
          { ...command, kind: "GetServiceConfig" }
        );
      }
    );
  }
}
