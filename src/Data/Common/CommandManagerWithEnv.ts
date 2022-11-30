import { useContext } from "react";
import { Command, CommandManager } from "@/Core";
import { DependencyContext } from "@/UI";

export function CommandManagerWithEnv<Kind extends Command.Kind>(
  kind: Kind,
  customGetTrigger: (
    command: Command.SubCommand<Kind>,
    environment: string
  ) => Command.Trigger<Kind>
): CommandManager {
  function matches(command: Command.SubCommand<Kind>): boolean {
    return command.kind === kind;
  }

  function useGetTrigger(
    command: Command.SubCommand<Kind>
  ): Command.Trigger<Kind> {
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();
    return customGetTrigger(command, environment);
  }
  return {
    matches,
    useGetTrigger,
  };
}
