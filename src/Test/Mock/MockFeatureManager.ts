import { FeatureManager } from "@/Core";

export class MockFeatureManager implements FeatureManager {
  isSupportEnabled(): boolean {
    return true;
  }

  getServerVersion(): string {
    return "4";
  }

  isLsmEnabled(): boolean {
    return true;
  }
}
