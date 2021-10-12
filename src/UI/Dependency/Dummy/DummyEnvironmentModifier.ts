import { EnvironmentModifier } from "@/Core";

export class DummyEnvironmentModifier implements EnvironmentModifier {
  setEnvironment(): void {
    throw new Error("Method not implemented.");
  }
  useIsHalted(): boolean {
    throw new Error("Method not implemented.");
  }
}
