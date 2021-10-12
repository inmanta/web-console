import { Command, CommandManager, Deleter } from "@/Core";

export class DeleteServiceCommandManager implements CommandManager {
  constructor(private readonly deleter: Deleter<"DeleteService">) {}

  matches(command: Command.SubCommand<"DeleteService">): boolean {
    return command.kind === "DeleteService";
  }

  getTrigger(
    command: Command.SubCommand<"DeleteService">
  ): Command.Trigger<"DeleteService"> {
    return () => this.deleter.delete(command);
  }
}
