import { Command, CommandProvider } from "@/Core";

export class DummyCommandProvider implements CommandProvider {
  getTrigger(): Command.Trigger<Command.Kind> {
    throw new Error("DummyCommandProvider.getTrigger called.");
  }
}
