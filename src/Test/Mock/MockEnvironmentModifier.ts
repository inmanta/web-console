import { EnvironmentModifier } from "@/Core";

export class MockEnvironmentModifier implements EnvironmentModifier {
  isHalted(): boolean {
    return false;
  }
  setEnvironment(): void {
    return;
  }
}
