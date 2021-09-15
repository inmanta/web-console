import { Command, CommandManager, Deleter, Updater } from "@/Core";

export class DeleteCallbackCommandManager implements CommandManager {
  constructor(
    private readonly deleter: Deleter<"DeleteCallback">,
    private readonly updater: Updater<"Callbacks">
  ) {}

  matches(command: Command.SubCommand<"DeleteCallback">): boolean {
    return command.kind === "DeleteCallback";
  }

  getTrigger(
    command: Command.SubCommand<"DeleteCallback">
  ): Command.Trigger<"DeleteCallback"> {
    return async () => {
      const result = await this.deleter.delete(command);
      await this.updater.update({
        kind: "Callbacks",
        service_entity: command.service_entity,
      });
      return result;
    };
  }
}
