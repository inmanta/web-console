import { OrchestratorProvider, JsonParserId, ServerStatus, StatusLicense } from "@/Core";

export class DummyOrchestratorProvider implements OrchestratorProvider {
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
  setAllFeatures(
    _features: Pick<ServerStatus, "features" | "extensions" | "version" | "edition" | "slices">
  ): void {
    throw new Error("Method not implemented.");
  }
}
