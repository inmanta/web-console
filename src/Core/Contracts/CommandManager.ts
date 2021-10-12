import { Command } from "@/Core/Domain";
import { TriggerProvider } from "./TriggerProvider";

export interface CommandManager extends TriggerProvider {
  matches(command: Command.Type): boolean;
}
