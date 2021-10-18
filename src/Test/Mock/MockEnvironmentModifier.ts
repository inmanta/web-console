import { EnvironmentModifier } from "@/Core";

export class MockEnvironmentModifier implements EnvironmentModifier {
  useIsHalted(): boolean {
    return false;
  }
  setEnvironment(): void {
    return;
  }
}
