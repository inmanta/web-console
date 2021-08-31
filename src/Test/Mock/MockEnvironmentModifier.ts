import { EnvironmentModifier } from "@/UI/Dependency/EnvironmentModifier";

export class MockEnvironmentModifier implements EnvironmentModifier {
  isHalted(): boolean {
    return false;
  }
  setEnvironment(): void {
    return;
  }
}
