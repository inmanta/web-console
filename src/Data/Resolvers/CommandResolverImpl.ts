import {
  Command,
  CommandResolver,
  CommandManager,
  ManagerResolver,
} from "@/Core";

export class CommandResolverImpl implements CommandResolver {
  constructor(
    private readonly managerResolver: ManagerResolver<CommandManager>
  ) {}

  useGetTrigger(command: Command.Type): Command.Trigger<typeof command.kind> {
    const manager = this.getManager(command);
    return manager.useGetTrigger(command);
  }

  private getManager(command: Command.Type): CommandManager {
    const manager = this.managerResolver
      .get()
      .find((manager) => manager.matches(command));
    if (typeof manager !== "undefined") return manager;
    throw new Error(`Can't find CommandManager for command ${command.kind}`);
  }
}
