import {
  Command,
  RemoteData,
  StateHelper,
  CommandManager,
  Query,
  ApiHelper,
} from "@/Core";

export class InstanceConfigCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelper<"GetInstanceConfig">,
    private readonly environment: string
  ) {}

  matches(command: Command.SubCommand<"UpdateInstanceConfig">): boolean {
    return command.kind === "UpdateInstanceConfig";
  }

  getTrigger(
    command: Command.SubCommand<"UpdateInstanceConfig">
  ): Command.Trigger<"UpdateInstanceConfig"> {
    return async (payload) => {
      switch (payload.kind) {
        case "RESET":
          this.reset(command);
          return;
        case "UPDATE":
          this.update(command, payload.option, payload.value);
      }
    };
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
    value: boolean
  ): Promise<void> {
    const configData = this.stateHelper.getOnce(this.getQuery(command));
    if (!RemoteData.isSuccess(configData)) return;

    this.stateHelper.set(
      RemoteData.fromEither(
        await this.apiHelper.post(this.getUrl(command), this.environment, {
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
    command: Command.SubCommand<"UpdateInstanceConfig">
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(
        await this.apiHelper.post(this.getUrl(command), this.environment, {
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
