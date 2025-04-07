import { Command } from "@/Core/Command";

/**
 * The TriggerProvider is responsible for providing a
 * trigger to components. This trigger can be used to
 * execute POST requests. The trigger receives a command
 * object which contains everything required to execute
 * the POST request.
 */
export interface TriggerProvider {
  useGetTrigger<Kind extends Command.Kind>(
    command: Command.Type,
  ): Command.Trigger<Kind>;
}
