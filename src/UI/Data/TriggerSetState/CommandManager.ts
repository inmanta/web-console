import { AuthHelper, Command, CommandManager, Either, Poster } from "@/Core";

export class TriggerSetStateCommandManager implements CommandManager {
  constructor(
    private readonly authHelper: AuthHelper,
    private readonly poster: Poster<"TriggerSetState">
  ) {}

  matches(command: Command.SubCommand<"TriggerSetState">): boolean {
    return command.kind === "TriggerSetState";
  }

  getTrigger(
    command: Command.SubCommand<"TriggerSetState">
  ): Command.Trigger<"TriggerSetState"> {
    return (targetState) => this.submit(command, targetState);
  }

  private async submit(
    command: Command.SubCommand<"TriggerSetState">,
    targetState: string
  ): Promise<
    Either.Type<
      Command.Error<"TriggerSetState">,
      Command.ApiData<"TriggerSetState">
    >
  > {
    const userName = this.authHelper.getLoggedInUserName();
    const message = userName
      ? `Triggered from the console by ${userName}`
      : "Triggered from the console";

    return await this.poster.post(command, {
      current_version: command.version,
      target_state: targetState,
      message,
    });
  }
}
