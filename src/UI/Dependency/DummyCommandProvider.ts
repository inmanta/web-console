import {
  Command,
  CommandManager,
  CommandProvider,
  ManagerResolver,
} from "@/Core";

export class DummyCommandProvider implements CommandProvider {
  getManagerResolver(): ManagerResolver<CommandManager> {
    throw new Error("Method not implemented.");
  }
  getTrigger(): Command.Trigger<Command.Kind> {
    throw new Error("Method not implemented.");
  }
}
