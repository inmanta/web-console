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

  getTrigger({
    qualifier,
  }: Command.SubCommand<"InstanceConfig">): Command.Trigger<"InstanceConfig"> {
    return async (payload) => {
      switch (payload.kind) {
        case "RESET":
          this.reset(qualifier);
          return;
        case "UPDATE":
          this.update(qualifier, payload.option, payload.value);
      }
    };
  }

  private async update(
    qualifier: Command.Qualifier<"InstanceConfig">,
    option: string,
    value: boolean
  ): Promise<void> {
    const configData = this.stateHelper.getOnce(qualifier);
    if (!RemoteData.isSuccess(configData)) return;

    this.stateHelper.set(
      RemoteData.fromEither(
        await this.poster.post(qualifier, {
          values: {
            ...configData.value,
            [option]: value,
          },
        })
      ),
      qualifier
    );
  }

  private async reset(
    qualifier: Command.Qualifier<"InstanceConfig">
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.poster.post(qualifier, { values: {} })),
      qualifier
    );
  }
}
