import { FeatureManager } from "@/Core";

export class MockFeatureManger implements FeatureManager {
  isLsmEnabled(): boolean {
    return true;
  }

  setServerStatus(): void {
    return undefined;
  }
}
