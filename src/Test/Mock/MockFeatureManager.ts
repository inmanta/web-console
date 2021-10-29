import { FeatureManager } from "@/Core";

export class MockFeatureManger implements FeatureManager {
  getServerVersion(): string {
    return "4";
  }

  isLsmEnabled(): boolean {
    return true;
  }

  setServerStatus(): void {
    return undefined;
  }
}
