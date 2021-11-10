import { EnvironmentHandler, FlatEnvironment } from "@/Core";

export class DummyEnvironmentHandler implements EnvironmentHandler {
  set(): void {
    throw new Error("Method not implemented.");
  }
  useSelected(): FlatEnvironment {
    throw new Error("Method not implemented.");
  }
}
