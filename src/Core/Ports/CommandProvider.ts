import { CommandManager } from "./CommandManager";
import { ManagerResolverGetter } from "./ManagerResolver";
import { TriggerProvider } from "./TriggerProvider";

export type CommandProvider = TriggerProvider &
  ManagerResolverGetter<CommandManager>;
