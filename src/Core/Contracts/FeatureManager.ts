import { JsonParserId } from "./JsonParser";

export interface FeatureManager {
  isLsmEnabled(): boolean;
  isSupportEnabled(): boolean;
  getServerMajorVersion(): string;
  getServerVersion(): string;
  getEdition(): string;
  getJsonParser(): JsonParserId;
  getCommitHash(): string;
  getAppVersion(): string;
  getLicenseInformation(): StatusLicense;
}

export interface StatusLicense {
  cert_valid_until?: string;
  entitlement_valid_until?: string;
}
