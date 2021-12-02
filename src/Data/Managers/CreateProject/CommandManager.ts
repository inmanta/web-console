import { ApiHelper, Command, CommandManager, Maybe, Updater } from "@/Core";

export class CreateProjectCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: Updater<"GetProjects">
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
    const result = await this.apiHelper.putWithoutResponseAndEnvironment(
      `/api/v2/project`,
      body
    );
    if (Maybe.isNone(result)) {
      await this.updater.update({
        kind: "GetProjects",
        environmentDetails: false,
      });
    }
    return result;
  }
}
