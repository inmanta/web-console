import {
  Command,
  CommandManager,
  PosterWithoutResponse,
  RemoteData,
  StateHelper,
  Updater,
} from "@/Core";

export class ResumeEnvironmentCommandManager implements CommandManager {
  constructor(
    private readonly poster: PosterWithoutResponse<"ResumeEnvironment">,
    private readonly stateHelper: StateHelper<"GetEnvironmentDetails">,
    private readonly updater: Updater<"GetEnvironmentDetails">
  ) {}

  matches(command: Command.SubCommand<"ResumeEnvironment">): boolean {
    return command.kind === "ResumeEnvironment";
  }

  getTrigger(
    command: Command.SubCommand<"ResumeEnvironment">
  ): Command.Trigger<"ResumeEnvironment"> {
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
