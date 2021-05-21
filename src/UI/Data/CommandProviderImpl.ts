import {
  CommandProvider,
  Command,
  CommandManager,
  ManagerResolver,
} from "@/Core";

export class CommandProviderImpl implements CommandProvider {
  constructor(
    private readonly managerResolver: ManagerResolver<CommandManager>
  ) {}

  getManagerResolver(): ManagerResolver<CommandManager> {
    return this.managerResolver;
  }

  getTrigger(command: Command.Type): Command.Trigger<typeof command.kind> {
    const manager = this.getManager(command);
    return manager.getTrigger(command);
  }

  private getManager(command: Command.Type): CommandManager {
    const manager = this.managerResolver
      .get()
      .find((manager) => manager.matches(command));
    if (typeof manager !== "undefined") return manager;
    throw new Error(`Can't find CommandManager for command ${command.kind}`);
  }
}
