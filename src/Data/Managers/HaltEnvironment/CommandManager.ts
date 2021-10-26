import {
  Command,
  CommandManager,
  PosterWithoutResponse,
  RemoteData,
  StateHelper,
  Updater,
} from "@/Core";

export class HaltEnvironmentCommandManager implements CommandManager {
  constructor(
    private readonly poster: PosterWithoutResponse<"HaltEnvironment">,
    private readonly stateHelper: StateHelper<"GetEnvironmentDetails">,
    private readonly updater: Updater<"GetEnvironmentDetails">
  ) {}

  matches(command: Command.SubCommand<"HaltEnvironment">): boolean {
    return command.kind === "HaltEnvironment";
  }

  getTrigger(
    command: Command.SubCommand<"HaltEnvironment">
  ): Command.Trigger<"HaltEnvironment"> {
    return async () => {
      this.stateHelper.set(RemoteData.loading(), {
        kind: "GetEnvironmentDetails",
      });
      const result = await this.poster.post(command, null);
      await this.updater.update({
        kind: "GetEnvironmentDetails",
      });
      return result;
    };
  }
}
