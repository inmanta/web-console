import { EnvironmentHandler, FlatEnvironment } from "@/Core";

export class DummyEnvironmentHandler implements EnvironmentHandler {
  useId(): string {
    throw new Error("Method not implemented.");
  }
  set(): void {
    throw new Error("Method not implemented.");
  }
  useSelected(): FlatEnvironment {
    throw new Error("Method not implemented.");
  }
}
