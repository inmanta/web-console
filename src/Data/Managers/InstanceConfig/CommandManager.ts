import { Command, RemoteData, StateHelper, Query, ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data";

export class InstanceConfigCommandManager extends CommandManagerWithEnv<"UpdateInstanceConfig"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelper<"GetInstanceConfig">
  ) {
    super("UpdateInstanceConfig", (command, environment) => {
      return async (payload) => {
        switch (payload.kind) {
          case "RESET":
            this.reset(command, environment);
            return;
          case "UPDATE":
            this.update(command, payload.option, payload.value, environment);
        }
      };
    });
  }

  private getQuery(
    command: Command.SubCommand<"UpdateInstanceConfig">
  ): Query.SubQuery<"GetInstanceConfig"> {
    return {
      ...command,
      kind: "GetInstanceConfig",
    };
  }

  private async update(
    command: Command.SubCommand<"UpdateInstanceConfig">,
    option: string,
    value: boolean,
    environment: string
  ): Promise<void> {
    const configData = this.stateHelper.getOnce(this.getQuery(command));
    if (!RemoteData.isSuccess(configData)) return;

    this.stateHelper.set(
      RemoteData.fromEither(
        await this.apiHelper.post(this.getUrl(command), environment, {
          values: {
            ...configData.value,
            [option]: value,
          },
        })
      ),
      this.getQuery(command)
    );
  }

  private async reset(
    command: Command.SubCommand<"UpdateInstanceConfig">,
    environment: string
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(
        await this.apiHelper.post(this.getUrl(command), environment, {
          values: {},
        })
      ),
      this.getQuery(command)
    );
  }

  private getUrl({
    service_entity,
    id,
    version,
  }: Command.SubCommand<"UpdateInstanceConfig">): string {
    return `/lsm/v1/service_inventory/${service_entity}/${id}/config?current_version=${version}`;
  }
}
