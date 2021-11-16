import { FeatureManager } from "@/Core";

export class MockFeatureManager implements FeatureManager {
  getServerVersion(): string {
    return "4";
  }

  isLsmEnabled(): boolean {
    return true;
  }
}
