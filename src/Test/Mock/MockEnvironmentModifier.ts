import { EnvironmentModifier } from "@/Core";

interface Details {
  server_compile: boolean;
  halted: boolean;
}

export class MockEnvironmentModifier implements EnvironmentModifier {
  constructor(private readonly details?: Details) {}

  useIsServerCompileEnabled(): boolean {
    return this.details ? this.details.server_compile : false;
  }
  useIsHalted(): boolean {
    return this.details ? this.details.halted : false;
  }
  setEnvironment(): void {
    return;
  }
}
