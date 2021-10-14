import { Command, CommandManager, Deleter, Maybe, Updater } from "@/Core";

export class DeleteEnvironmentCommandManager implements CommandManager {
  constructor(
    private readonly deleter: Deleter<"DeleteEnvironment">,
    private readonly updater: Updater<"Projects">
  ) {}

  matches(command: Command.SubCommand<"DeleteEnvironment">): boolean {
    return command.kind === "DeleteEnvironment";
  }

  getTrigger(
    command: Command.SubCommand<"DeleteEnvironment">
  ): Command.Trigger<"DeleteEnvironment"> {
    return async () => {
      const error = await this.deleter.delete(command);
      if (Maybe.isSome(error)) return error;
      await this.updater.update({
        kind: "Projects",
      });
      return error;
    };
  }
}
