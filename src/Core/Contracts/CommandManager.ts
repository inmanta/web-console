import { Command } from "@/Core/Command";
import { TriggerProvider } from "./TriggerProvider";

export interface CommandManager extends TriggerProvider {
  matches(command: Command.Type): boolean;
}
