import {
  Command,
  RemoteData,
  StateHelper,
  Poster,
  CommandManager,
} from "@/Core";

export class InstanceConfigCommandManager implements CommandManager {
  constructor(
    private readonly poster: Poster<"InstanceConfig">,
    private readonly stateHelper: StateHelper<"InstanceConfig">
  ) {}

  matches(command: Command.SubCommand<"InstanceConfig">): boolean {
    return command.kind === "InstanceConfig";
  }

  getTrigger(
    command: Command.SubCommand<"InstanceConfig">
  ): Command.Trigger<"InstanceConfig"> {
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

  private async update(
    command: Command.SubCommand<"InstanceConfig">,
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

  private async reset(
    command: Command.SubCommand<"InstanceConfig">
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.poster.post(command, { values: {} })),
      command
    );
  }
}
