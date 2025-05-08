import { ServerStatus } from "../Domain/ServerStatus";
import { JsonParserId } from "./JsonParser";

/**
 * Interface that represents the feature manager.
 */
export interface FeatureManager {
  isLicencedFeatureEnabled(feature: Feature): boolean;
  isLsmEnabled(): boolean;
  isSupportEnabled(): boolean;
  isOrderViewEnabled(): boolean;
  isResourceDiscoveryEnabled(): boolean;
  isComposerEnabled(): boolean;
  getServerMajorVersion(): string;
  getServerVersion(): string;
  getEdition(): string;
  getJsonParser(): JsonParserId;
  getCommitHash(): string;
  getAppVersion(): string;
  getLicenseInformation(): StatusLicense | undefined;
  setServerStatus(serverStatus: ServerStatus): void;
}

// Status license tells whether the license is still valid.
export interface StatusLicense {
  cert_valid_until?: string;
  entitlement_valid_until?: string;
}

// Licensed features are provided by the API. It is extracted from the license.
// These are not local feature flags.
export type Feature = "core.resource" | "lsm.order" | "ui.ui";

export type Extention = "support" | "lsm";

export const FEATURE_LIST: Record<string, Feature> = {
  resource: "core.resource",
  order: "lsm.order",
  composer: "ui.ui",
};

export const EXTENSION_LIST: Record<string, Extention> = {
  support: "support",
  lsm: "lsm",
};
