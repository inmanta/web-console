import { FeatureManager, JsonParserId, StatusLicense } from "@/Core";

export class DummyFeatureManager implements FeatureManager {
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
