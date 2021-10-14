import { FeatureManager } from "@/Core";

export class DummyFeatureManager implements FeatureManager {
  setServerStatus(): void {
    throw new Error("Method not implemented.");
  }
  isLsmEnabled(): boolean {
    throw new Error("Method not implemented.");
  }
}
