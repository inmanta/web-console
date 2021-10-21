import {
  Command,
  CommandManager,
  ModifyEnvironmentParams,
  Maybe,
  PosterWithoutResponse,
  Updater,
} from "@/Core";

export class ModifyEnvironmentCommandManager implements CommandManager {
  constructor(
    private readonly poster: PosterWithoutResponse<"ModifyEnvironment">,
    private readonly updater: Updater<"Projects">
  ) {}

  matches(command: Command.SubCommand<"ModifyEnvironment">): boolean {
    return command.kind === "ModifyEnvironment";
  }

  getTrigger(
    command: Command.SubCommand<"ModifyEnvironment">
  ): Command.Trigger<"ModifyEnvironment"> {
    return (body: ModifyEnvironmentParams) => this.submit(command, body);
  }

  private async submit(
    command: Command.SubCommand<"ModifyEnvironment">,
    body: ModifyEnvironmentParams
  ): Promise<Maybe.Type<Command.Error<"ModifyEnvironment">>> {
    const error = await this.poster.post(command, body);
    await this.updater.update({
      kind: "Projects",
    });
    return error;
  }
}
