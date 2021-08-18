import {
  Command,
  CommandManager,
  CommandResolver,
  ManagerResolver,
} from "@/Core";

export class DummyCommandResolver implements CommandResolver {
  getManagerResolver(): ManagerResolver<CommandManager> {
    throw new Error("Method not implemented.");
  }
  getTrigger(): Command.Trigger<Command.Kind> {
    throw new Error("Method not implemented.");
  }
}
