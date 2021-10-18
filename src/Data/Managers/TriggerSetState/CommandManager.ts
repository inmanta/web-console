import {
  AuthHelper,
  Command,
  CommandManager,
  Maybe,
  PosterWithoutResponse,
} from "@/Core";

export class TriggerSetStateCommandManager implements CommandManager {
  constructor(
    private readonly authHelper: AuthHelper,
    private readonly poster: PosterWithoutResponse<"TriggerSetState">
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
  ): Promise<Maybe.Type<Command.Error<"TriggerSetState">>> {
    const userName = this.authHelper.getUsername();
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
