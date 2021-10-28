import {
  ApiHelper,
  Command,
  CommandManager,
  RemoteData,
  StateHelper,
  Updater,
} from "@/Core";

export class HaltEnvironmentCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelper<"GetEnvironmentDetails">,
    private readonly updater: Updater<"GetEnvironmentDetails">,
    private readonly environment: string
  ) {}

  matches(command: Command.SubCommand<"HaltEnvironment">): boolean {
    return command.kind === "HaltEnvironment";
  }

  getTrigger(): Command.Trigger<"HaltEnvironment"> {
    return async () => {
      this.stateHelper.set(RemoteData.loading(), {
        kind: "GetEnvironmentDetails",
      });
      const result = await this.apiHelper.postWithoutResponse(
        `/api/v2/actions/environment/halt`,
        this.environment,
        null
      );
      await this.updater.update({
        kind: "GetEnvironmentDetails",
      });
      return result;
    };
  }
}
