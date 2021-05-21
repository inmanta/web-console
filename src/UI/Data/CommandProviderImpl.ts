import { CommandProvider, Command, CommandManager } from "@/Core";

export class CommandProviderImpl implements CommandProvider {
  constructor(private readonly managers: CommandManager[]) {}

  getTrigger(command: Command.Type): Command.Trigger<typeof command.kind> {
    const manager = this.getManager(command);
    return manager.getTrigger(command);
  }

  private getManager(command: Command.Type): CommandManager {
    const manager = this.managers.find((manager) => manager.matches(command));
    if (typeof manager !== "undefined") return manager;
    throw new Error(`Can't find CommandManager for command ${command.kind}`);
  }
}
