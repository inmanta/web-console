import { Command, RemoteData, StateHelper, Query, ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function InstanceConfigCommandManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelper<"GetInstanceConfig">
) {
  function getQuery(
    command: Command.SubCommand<"UpdateInstanceConfig">
  ): Query.SubQuery<"GetInstanceConfig"> {
    return {
      ...command,
      kind: "GetInstanceConfig",
    };
  }

  async function update(
    command: Command.SubCommand<"UpdateInstanceConfig">,
    option: string,
    value: boolean,
    environment: string
  ): Promise<void> {
    const configData = stateHelper.getOnce(getQuery(command));
    if (!RemoteData.isSuccess(configData)) return;

    stateHelper.set(
      RemoteData.fromEither(
        await apiHelper.post(getUrl(command), environment, {
          values: {
            ...configData.value,
            [option]: value,
          },
        })
      ),
      getQuery(command)
    );
  }

  async function reset(
    command: Command.SubCommand<"UpdateInstanceConfig">,
    environment: string
  ): Promise<void> {
    stateHelper.set(
      RemoteData.fromEither(
        await apiHelper.post(getUrl(command), environment, {
          values: {},
        })
      ),
      getQuery(command)
    );
  }

  function getUrl({
    service_entity,
    id,
    version,
  }: Command.SubCommand<"UpdateInstanceConfig">): string {
    return `/lsm/v1/service_inventory/${service_entity}/${id}/config?current_version=${version}`;
  }

  return CommandManagerWithEnv<"UpdateInstanceConfig">(
    "UpdateInstanceConfig",
    (command, environment) => {
      return async (payload) => {
        switch (payload.kind) {
          case "RESET":
            reset(command, environment);
            return;
          case "UPDATE":
            update(command, payload.option, payload.value, environment);
        }
      };
    }
  );
}
