import { useContext } from "react";
import { Command, CommandManager } from "@/Core";
import { DependencyContext } from "@/UI";

export class PrimaryCommandManager<Kind extends Command.Kind>
  implements CommandManager
{
  constructor(
    private readonly kind: Kind,
    private readonly customGetTrigger: (
      command: Command.SubCommand<Kind>,
      environment: string
    ) => Command.Trigger<Kind>
  ) {}

  matches(command: Command.SubCommand<Kind>): boolean {
    return command.kind === this.kind;
  }

  getTrigger(command: Command.SubCommand<Kind>): Command.Trigger<Kind> {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();
    return this.customGetTrigger(command, environment);
  }
}
