import { FeatureManager, JsonParserId } from "@/Core";

export class MockFeatureManager implements FeatureManager {
  getJsonParser(): JsonParserId {
    return "Native";
  }

  getServerVersion(): string {
    return "4.1";
  }

  isSupportEnabled(): boolean {
    return true;
  }

  getServerMajorVersion(): string {
    return "4";
  }

  isLsmEnabled(): boolean {
    return true;
  }

  getEdition(): string {
    return "Standard Edition";
  }
}
