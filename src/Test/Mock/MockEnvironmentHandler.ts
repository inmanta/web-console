import { EnvironmentHandler, FlatEnvironment } from "@/Core";

export class MockEnvironmentHandler implements EnvironmentHandler {
  constructor(private readonly environment: string) {}
  useId(): string {
    return this.environment;
  }
  set(): void {
    throw new Error("Method not implemented.");
  }
  useSelected(): FlatEnvironment {
    throw new Error("Method not implemented.");
  }
}
