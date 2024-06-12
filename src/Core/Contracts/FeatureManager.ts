import { JsonParserId } from "./JsonParser";

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
}

export interface StatusLicense {
  cert_valid_until?: string;
  entitlement_valid_until?: string;
}

export type Feature = "core.resource" | "lsm.order" | "ui.ui" | "json.editor";

export type Extention = "support" | "lsm";

export const FEATURE_LIST: Record<string, Feature> = {
  resource: "core.resource",
  order: "lsm.order",
  composer: "ui.ui",
  editor: "json.editor",
};

export const EXTENSION_LIST: Record<string, Extention> = {
  support: "support",
  lsm: "lsm",
};
