import { ApiHelper, Command, CommandManager, Query, Updater } from "@/Core";

export class PromoteVersionCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: Updater<"GetDesiredStates">,
    private readonly environment: string
  ) {}

  matches(command: Command.SubCommand<"PromoteVersion">): boolean {
    return command.kind === "PromoteVersion";
  }

  getTrigger(
    command: Command.SubCommand<"PromoteVersion">
  ): Command.Trigger<"PromoteVersion"> {
    return async (query: Query.SubQuery<"GetDesiredStates">) => {
      const result = await this.apiHelper.postWithoutResponse(
        `/api/v2/desiredstate/${command.version}/promote`,
        this.environment,
        null
      );
      await this.updater.update(query);
      return result;
    };
  }
}
