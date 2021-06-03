import { Command, CommandManager, Deleter } from "@/Core";

export class DeleteInstanceCommandManager implements CommandManager {
  constructor(private readonly deleter: Deleter<"DeleteInstance">) {}

  matches(command: Command.SubCommand<"DeleteInstance">): boolean {
    return command.kind === "DeleteInstance";
  }

  getTrigger(
    command: Command.SubCommand<"DeleteInstance">
  ): Command.Trigger<"DeleteInstance"> {
    return async () => {
      return await this.deleter.delete(command);
    };
  }
}
