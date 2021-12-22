import {
  Command,
  CommandManager,
  ModifyEnvironmentParams,
  Maybe,
  ApiHelper,
  UpdaterWithEnv,
} from "@/Core";

export class ModifyEnvironmentCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: UpdaterWithEnv<"GetEnvironmentDetails">,
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
    await this.updater.update(
      {
        kind: "GetEnvironmentDetails",
        details: true,
      },
      this.environment
    );
    return error;
  }
}
