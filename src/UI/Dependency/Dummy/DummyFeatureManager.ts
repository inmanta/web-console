import { FeatureManager } from "@/Core";

export class DummyFeatureManager implements FeatureManager {
  getServerVersion(): string {
    throw new Error("Method not implemented.");
  }
  getEdition(): string {
    throw new Error("Method not implemented.");
  }
  isSupportEnabled(): boolean {
    throw new Error("Method not implemented.");
  }
  isLsmEnabled(): boolean {
    throw new Error("Method not implemented.");
  }
  getServerMajorVersion(): string {
    throw new Error("Method not implemented.");
  }
}
