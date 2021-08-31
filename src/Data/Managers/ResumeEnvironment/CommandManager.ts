import { Command, CommandManager, Maybe, PosterWithoutResponse } from "@/Core";

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
    return () => this.submit(command);
  }

  private async submit(
    command: Command.SubCommand<"ResumeEnvironment">
  ): Promise<Maybe.Type<Command.Error<"ResumeEnvironment">>> {
    return await this.poster.post(command, null);
  }
}
