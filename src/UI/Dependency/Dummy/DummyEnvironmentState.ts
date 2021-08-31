import { EnvironmentModifier } from "../EnvironmentModifier";

export class DummyEnvironmentModifier implements EnvironmentModifier {
  setEnvironment(): void {
    throw new Error("Method not implemented.");
  }
  isHalted(): boolean {
    throw new Error("Method not implemented.");
  }
}
