import { CommandManager, Command } from "@/Core";

export class MockCommandManager implements CommandManager {
  matches(): boolean {
    return true;
  }
  useGetTrigger(): Command.Trigger<Command.Kind> {
    return () => undefined;
  }
}
