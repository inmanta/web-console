import { Command, CommandResolver } from "@/Core";

export class DummyCommandResolver implements CommandResolver {
  getTrigger(): Command.Trigger<Command.Kind> {
    throw new Error("Method not implemented.");
  }
}
