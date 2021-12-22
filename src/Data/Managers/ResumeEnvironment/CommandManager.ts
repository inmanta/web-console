import {
  ApiHelper,
  Command,
  CommandManager,
  RemoteData,
  StateHelperWithEnv,
  Updater,
} from "@/Core";

export class ResumeEnvironmentCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelperWithEnv<"GetEnvironmentDetails">,
    private readonly updater: Updater<"GetEnvironmentDetails">,
    private readonly environment: string
  ) {}

  matches(command: Command.SubCommand<"ResumeEnvironment">): boolean {
    return command.kind === "ResumeEnvironment";
  }

  getTrigger(): Command.Trigger<"ResumeEnvironment"> {
    return async () => {
      this.stateHelper.set(
        RemoteData.loading(),
        {
          kind: "GetEnvironmentDetails",
          details: false,
        },
        this.environment
      );
      const result = await this.apiHelper.postWithoutResponse(
        `/api/v2/actions/environment/resume`,
        this.environment,
        null
      );
      await this.updater.update({
        kind: "GetEnvironmentDetails",
        details: false,
      });
      return result;
    };
  }
}
