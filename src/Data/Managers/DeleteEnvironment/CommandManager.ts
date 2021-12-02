import { ApiHelper, Command, CommandManager, Maybe, Updater } from "@/Core";

export class DeleteEnvironmentCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: Updater<"GetEnvironments">
  ) {}

  matches(command: Command.SubCommand<"DeleteEnvironment">): boolean {
    return command.kind === "DeleteEnvironment";
  }

  getTrigger({
    id,
  }: Command.SubCommand<"DeleteEnvironment">): Command.Trigger<"DeleteEnvironment"> {
    return async () => {
      const error = await this.apiHelper.delete(
        `/api/v2/environment/${id}`,
        id
      );
      if (Maybe.isSome(error)) return error;
      await this.updater.update({
        kind: "GetEnvironments",
        details: true,
      });
      return error;
    };
  }
}
