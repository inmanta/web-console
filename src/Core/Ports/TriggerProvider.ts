import { Command } from "@/Core/Domain";

/**
 * The TriggerProvider is responsible for providing a
 * trigger to components. This trigger can be used to
 * execute POST requests. The trigger receives a command
 * object which contains everything required to execute
 * the POST request.
 */
export interface TriggerProvider {
  getTrigger(command: Command.Type): Command.Trigger<typeof command.kind>;
}

export type CommandProvider = TriggerProvider;
