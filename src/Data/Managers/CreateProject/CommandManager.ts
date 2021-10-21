import { ApiHelper, Command, CommandManager, Maybe, Updater } from "@/Core";

export class CreateProjectCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: Updater<"Projects">
  ) {}

  matches(command: Command.SubCommand<"CreateProject">): boolean {
    return command.kind === "CreateProject";
  }

  getTrigger(
    command: Command.SubCommand<"CreateProject">
  ): Command.Trigger<"CreateProject"> {
    return (name: string) => this.submit(command, { name });
  }

  private async submit(
    command: Command.SubCommand<"CreateProject">,
    body: { name: string }
  ): Promise<Maybe.Type<Command.Error<"CreateProject">>> {
    const error = await this.apiHelper.putWithoutResponseAndEnvironment(
      this.getUrl(),
      body
    );
    await this.updater.update({
      kind: "Projects",
    });
    return error;
  }
  private getUrl(): string {
    return `/api/v2/project`;
  }
}
