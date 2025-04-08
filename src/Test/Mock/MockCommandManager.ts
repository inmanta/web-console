import { CommandManager, Command } from "@/Core";

export class MockCommandManager implements CommandManager {
  matches(): boolean {
    return true;
  }
  useGetTrigger(): Command.Trigger<Command.Kind> {
    //with removed one of types undefined became highlighted by the tsc.
    // I decided the easiest approach is to temporarily type it as any as we are in the process to get rid of the Command Manager completely

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return () => undefined as any;
  }
}
