import { Command, CommandManager, PosterWithoutResponse } from "@/Core";

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
    return () => this.poster.post(command, null);
  }
}
