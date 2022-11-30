import { Command, CommandManager } from "@/Core";

export class CommandManagerWithoutEnv<Kind extends Command.Kind>
  implements CommandManager
{
  constructor(
    private readonly kind: Kind,
    private readonly customGetTrigger: (
      command: Command.SubCommand<Kind>
    ) => Command.Trigger<Kind>
  ) {}

  matches(command: Command.SubCommand<Kind>): boolean {
    return command.kind === this.kind;
  }

  useGetTrigger(command: Command.SubCommand<Kind>): Command.Trigger<Kind> {
    return this.customGetTrigger(command);
  }
}
