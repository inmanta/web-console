import {
  Command,
  CommandManager,
  ModifyEnvironmentParams,
  Maybe,
  Updater,
  ApiHelper,
} from "@/Core";

export class ModifyEnvironmentCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: Updater<"GetEnvironments">,
    private readonly environment: string
  ) {}

  matches(command: Command.SubCommand<"ModifyEnvironment">): boolean {
    return command.kind === "ModifyEnvironment";
  }

  getTrigger(): Command.Trigger<"ModifyEnvironment"> {
    return (body: ModifyEnvironmentParams) => this.submit(body);
  }

  private async submit(
    body: ModifyEnvironmentParams
  ): Promise<Maybe.Type<Command.Error<"ModifyEnvironment">>> {
    const error = await this.apiHelper.postWithoutResponseAndEnvironment(
      `/api/v2/environment/${this.environment}`,
      body
    );
    await this.updater.update({
      kind: "GetEnvironments",
      details: true,
    });
    return error;
  }
}
