import { FeatureManager, JsonParserId, StatusLicense, ServerStatus } from "@/Core";

export class DummyFeatureManager implements FeatureManager {
  set(status: ServerStatus): void {
    throw new Error("Method not implemented.");
  }
  getCommitHash(): string {
    throw new Error("Method not implemented.");
  }
  getAppVersion(): string {
    throw new Error("Method not implemented");
  }
  getJsonParser(): JsonParserId {
    throw new Error("Method not implemented.");
  }
  getServerVersion(): string {
    throw new Error("Method not implemented.");
  }
  isComposerEnabled(): boolean {
    throw new Error("Method not implemented.");
  }
  isOrderViewEnabled(): boolean {
    throw new Error("Method not implemented.");
  }
  isLicencedFeatureEnabled(): boolean {
    throw new Error("Method not implemented.");
  }
  isResourceDiscoveryEnabled(): boolean {
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
  getLicenseInformation(): StatusLicense {
    throw new Error("Method not implemented.");
  }
}
