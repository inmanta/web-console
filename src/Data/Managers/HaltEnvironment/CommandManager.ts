import { Command, CommandManager, Maybe, PosterWithoutResponse } from "@/Core";

export class HaltEnvironmentCommandManager implements CommandManager {
  constructor(
    private readonly poster: PosterWithoutResponse<"HaltEnvironment">
  ) {}

  matches(command: Command.SubCommand<"HaltEnvironment">): boolean {
    return command.kind === "HaltEnvironment";
  }

  getTrigger(
    command: Command.SubCommand<"HaltEnvironment">
  ): Command.Trigger<"HaltEnvironment"> {
    return () => this.submit(command);
  }

  private async submit(
    command: Command.SubCommand<"HaltEnvironment">
  ): Promise<Maybe.Type<Command.Error<"HaltEnvironment">>> {
    return await this.poster.post(command, null);
  }
}
