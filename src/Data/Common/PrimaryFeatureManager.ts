import { useEffect } from "react";
import {
  FeatureManager,
  Feature,
  Extention,
  JsonParserId,
  ServerStatus,
  StatusLicense,
  EXTENSION_LIST,
  FEATURE_LIST,
} from "@/Core";
import { words } from "@/UI";

/**
 * Represents the primary feature manager.
 * Implements the FeatureManager interface.
 */
export const PrimaryFeatureManager = (
  jsonParserId: JsonParserId = "Native",
  commitHash: string = "",
  appVersion: string = "",
  features?: Pick<ServerStatus, "features" | "extensions" | "version" | "edition" | "slices"> | null
): FeatureManager => {
  /**
   * Gets the version of the application.
   * @returns The version of the application.
   */
  function getAppVersion(): string {
    return appVersion;
  }

  /**
   * Gets the commit hash of the application.
   * @returns The commit hash of the application.
   */
  function getCommitHash(): string {
    return commitHash;
  }

  function get(): Pick<ServerStatus, "features" | "extensions" | "version" | "edition" | "slices"> {
    if (!features) {
      throw new Error(words("features.missing"));
    }

    return features;
  }

  /**
   * Gets the extensions of the ServerStatus object.
   * @private
   *
   * @returns The extensions of the ServerStatus object.
   */
  function getExtensions(): string[] {
    return get().extensions.map((extension) => extension.name);
  }

  /**
   * Checks if an extension is enabled in the ServerStatus object.
   * @private
   *
   * @param extension - The name of the extension.
   * @returns True if the extension is enabled, false otherwise.
   */
  function isExtensionEnabled(extension: Extention): boolean {
    return getExtensions().includes(extension);
  }

  /**
   * Checks if a feature is enabled in the ServerStatus object.
   *
   * @param featureSlice - The slice of the feature.
   * @returns True if the feature is enabled, false otherwise.
   */
  function isLicencedFeatureEnabled(featureSlice: Feature): boolean {
    return get().features.some(
      (feature) => feature.slice === featureSlice && feature.value === true
    );
  }

  /**
   * Gets the ID of the JSON parser.
   * @returns The ID of the JSON parser.
   */
  function getJsonParser(): JsonParserId {
    return jsonParserId;
  }

  /**
   * Checks if the "support" extension is enabled.
   * @returns True if the "support" extension is enabled, false otherwise.
   */
  function isSupportEnabled(): boolean {
    return isExtensionEnabled(EXTENSION_LIST.support);
  }

  /**
   * Checks if the "lsm" extension is enabled.
   * @returns True if the "lsm" extension is enabled, false otherwise.
   */
  function isLsmEnabled(): boolean {
    return isExtensionEnabled(EXTENSION_LIST.lsm);
  }

  /**
   * Checks if the "resource-discovery" feature is enabled.
   * @returns True if the "resource-discovery" feature is enabled, false otherwise.
   */
  function isResourceDiscoveryEnabled(): boolean {
    return isLicencedFeatureEnabled(FEATURE_LIST.resource);
  }

  /**
   * Checks if the "orderview"  is enabled.
   * @returns True if the "orderview" is enabled, false otherwise.
   */
  function isOrderViewEnabled(): boolean {
    return isLicencedFeatureEnabled(FEATURE_LIST.order);
  }

  /**
   * Checks if the "composer" feature is enabled.
   * @returns True if the composer feature is enabled, false otherwise.
   */
  function isComposerEnabled(): boolean {
    return isLicencedFeatureEnabled(FEATURE_LIST.composer);
  }

  /**
   * Gets the major version of the server.
   * @returns The major version of the server.
   */
  function getServerMajorVersion(): string {
    const serverStatus = get();

    return serverStatus.version.split(".")[0];
  }

  /**
   * Gets the full version of the server.
   * @returns The full version of the server.
   */
  function getServerVersion(): string {
    const fullVersion = get().version;

    return fullVersion.indexOf(".dev") > -1
      ? fullVersion.substring(0, fullVersion.indexOf(".dev"))
      : fullVersion;
  }

  /**
   * Gets the edition of the server.
   * @returns The edition of the server.
   */
  function getEdition(): string {
    return get().edition;
  }

  /**
   * Gets the license information of the server.
   * @returns The license information of the server, or undefined if not available.
   */
  function getLicenseInformation(): StatusLicense | undefined {
    const serverStatus = get();
    const licenceInformation = serverStatus.slices.find(
      (slice) => slice.name === "license.license"
    );

    return licenceInformation?.status;
  }

  useEffect(() => {
    console.info(
      `Application configured with ${jsonParserId} JSON parser, Version : ${appVersion}, Commit: ${commitHash}`
    );
  }, [jsonParserId, appVersion, commitHash]);

  return {
    getAppVersion,
    getCommitHash,
    isLicencedFeatureEnabled,
    getJsonParser,
    isSupportEnabled,
    isLsmEnabled,
    isResourceDiscoveryEnabled,
    isOrderViewEnabled,
    isComposerEnabled,
    getServerMajorVersion,
    getServerVersion,
    getEdition,
    getLicenseInformation,
  };
};
