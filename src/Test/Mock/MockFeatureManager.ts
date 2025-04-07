import { Feature, FeatureManager, JsonParserId, StatusLicense } from "@/Core";

export class MockFeatureManager implements FeatureManager {
  getCommitHash (): string {
    return "123456abcdef";
  }

  getAppVersion (): string {
    return "1.10.11";
  }

  getJsonParser (): JsonParserId {
    return "Native";
  }

  getServerVersion (): string {
    return "4.1";
  }

  isLicencedFeatureEnabled (_feature: Feature): boolean {
    return true;
  }

  isSupportEnabled (): boolean {
    return true;
  }

  isComposerEnabled (): boolean {
    return true;
  }

  isOrderViewEnabled (): boolean {
    return true;
  }

  isResourceDiscoveryEnabled (): boolean {
    return true;
  }

  getServerMajorVersion (): string {
    return "4";
  }

  isLsmEnabled (): boolean {
    return true;
  }

  getEdition (): string {
    return "Standard Edition";
  }

  getLicenseInformation (): StatusLicense {
    return {
      cert_valid_until: "2025-10-01T08:59:00.000000",
      entitlement_valid_until: "2021-11-01T19:04:14.000000",
    };
  }
}

export class MockEditableFeatureManager implements FeatureManager {
  getCommitHash (): string {
    return "123456abcdef";
  }

  getAppVersion (): string {
    return "@inmanta/1.10.11";
  }

  getJsonParser (): JsonParserId {
    return "Native";
  }

  getServerVersion (): string {
    return "4.1";
  }

  isLicencedFeatureEnabled (_feature: Feature): boolean {
    return true;
  }

  isSupportEnabled (): boolean {
    return true;
  }

  isComposerEnabled (): boolean {
    return true;
  }

  isOrderViewEnabled (): boolean {
    return true;
  }

  isResourceDiscoveryEnabled (): boolean {
    return true;
  }

  getServerMajorVersion (): string {
    return "4";
  }

  isLsmEnabled (): boolean {
    return true;
  }

  getEdition (): string {
    return "Open Source";
  }

  getLicenseInformation (): StatusLicense {
    return {
      cert_valid_until: "2025-10-01T08:59:00.000000",
      entitlement_valid_until: "2021-11-01T19:04:14.000000",
    };
  }
}

export class MockLimitedFeatureManager implements FeatureManager {
  getCommitHash (): string {
    return "123456abcdef";
  }

  getAppVersion (): string {
    return "@inmanta/1.10.11";
  }

  getJsonParser (): JsonParserId {
    return "Native";
  }

  getServerVersion (): string {
    return "4.1";
  }

  isLicencedFeatureEnabled (_feature: Feature): boolean {
    return false;
  }

  isSupportEnabled (): boolean {
    return true;
  }

  isComposerEnabled (): boolean {
    return false;
  }

  isOrderViewEnabled (): boolean {
    return false;
  }

  isResourceDiscoveryEnabled (): boolean {
    return false;
  }

  getServerMajorVersion (): string {
    return "4";
  }

  isLsmEnabled (): boolean {
    return true;
  }

  getEdition (): string {
    return "Open Source";
  }

  getLicenseInformation (): StatusLicense {
    return {
      cert_valid_until: "2025-10-01T08:59:00.000000",
      entitlement_valid_until: "2021-11-01T19:04:14.000000",
    };
  }
}
