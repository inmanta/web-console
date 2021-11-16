import { FeatureManager } from "@/Core";

export class DummyFeatureManager implements FeatureManager {
  isLsmEnabled(): boolean {
    throw new Error("Method not implemented.");
  }
  getServerVersion(): string {
    throw new Error("Method not implemented.");
  }
}
