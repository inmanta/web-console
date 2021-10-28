import {
  Command,
  RemoteData,
  StateHelper,
  CommandManager,
  Query,
  ApiHelper,
} from "@/Core";

export class ServiceConfigCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelper<"GetServiceConfig">,
    private readonly environment: string
  ) {}

  matches(command: Command.SubCommand<"UpdateServiceConfig">): boolean {
    return command.kind === "UpdateServiceConfig";
  }

  getTrigger(
    command: Command.SubCommand<"UpdateServiceConfig">
  ): Command.Trigger<"UpdateServiceConfig"> {
    return async (option, value) => {
      this.update(command, option, value);
    };
  }

  private getQuery(
    command: Command.SubCommand<"UpdateServiceConfig">
  ): Query.SubQuery<"GetServiceConfig"> {
    return { ...command, kind: "GetServiceConfig" };
  }

  private async update(
    command: Command.SubCommand<"UpdateServiceConfig">,
    option: string,
    value: boolean
  ): Promise<void> {
    const configData = this.stateHelper.getOnce(this.getQuery(command));
    if (!RemoteData.isSuccess(configData)) return;

    this.stateHelper.set(
      RemoteData.fromEither(
        await this.apiHelper.post(
          `/lsm/v1/service_catalog/${name}/config`,
          this.environment,
          {
            values: {
              ...configData.value,
              [option]: value,
            },
          }
        )
      ),
      this.getQuery(command)
    );
  }
}
