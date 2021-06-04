import {
  Command,
  RemoteData,
  StateHelper,
  Poster,
  CommandManager,
} from "@/Core";

export class ServiceConfigCommandManager implements CommandManager {
  constructor(
    private readonly poster: Poster<"ServiceConfig">,
    private readonly stateHelper: StateHelper<"ServiceConfig">
  ) {}

  matches(command: Command.SubCommand<"ServiceConfig">): boolean {
    return command.kind === "ServiceConfig";
  }

  getTrigger(
    command: Command.SubCommand<"ServiceConfig">
  ): Command.Trigger<"ServiceConfig"> {
    return async (option, value) => {
      this.update(command, option, value);
    };
  }

  private async update(
    command: Command.SubCommand<"ServiceConfig">,
    option: string,
    value: boolean
  ): Promise<void> {
    const configData = this.stateHelper.getOnce(command);
    if (!RemoteData.isSuccess(configData)) return;

    this.stateHelper.set(
      RemoteData.fromEither(
        await this.poster.post(command, {
          values: {
            ...configData.value,
            [option]: value,
          },
        })
      ),
      command
    );
  }
}
