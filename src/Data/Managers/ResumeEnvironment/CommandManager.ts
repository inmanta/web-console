import { Command, CommandManager, PosterWithoutResponse } from "@/Core";

export class ResumeEnvironmentCommandManager implements CommandManager {
  constructor(
    private readonly poster: PosterWithoutResponse<"ResumeEnvironment">
  ) {}

  matches(command: Command.SubCommand<"ResumeEnvironment">): boolean {
    return command.kind === "ResumeEnvironment";
  }

  getTrigger(
    command: Command.SubCommand<"ResumeEnvironment">
  ): Command.Trigger<"ResumeEnvironment"> {
    return () => this.poster.post(command, null);
  }
}
