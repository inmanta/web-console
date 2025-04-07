import { EnvironmentModifier } from "@/Core";

export class DummyEnvironmentModifier implements EnvironmentModifier {
  useIsProtectedEnvironment(): boolean {
    throw new Error("Method not implemented.");
  }
  useIsServerCompileEnabled(): boolean {
    throw new Error("Method not implemented.");
  }
  setEnvironment(): void {
    throw new Error("Method not implemented.");
  }
  useIsHalted(): boolean {
    throw new Error("Method not implemented.");
  }
  useIsExpertModeEnabled(): boolean {
    throw new Error("Method not implemented.");
  }
}
