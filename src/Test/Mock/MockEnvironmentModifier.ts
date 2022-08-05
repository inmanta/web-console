import { EnvironmentModifier } from "@/Core";

interface Details {
  server_compile: boolean;
  halted: boolean;
  protected_environment: boolean;
}

export class MockEnvironmentModifier implements EnvironmentModifier {
  constructor(private readonly details?: Details) {}
  useIsProtectedEnvironment(): boolean {
    return this.details ? this.details.protected_environment : false;
  }

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
