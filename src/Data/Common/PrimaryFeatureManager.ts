import {
  FeatureManager,
  JsonParserId,
  Logger,
  RemoteData,
  ServerStatus,
  StateHelper,
  StatusLicense,
} from "@/Core";
import { VoidLogger } from "./VoidLogger";

/**
 * Represents the primary feature manager.
 * Implements the FeatureManager interface.
 */
export class PrimaryFeatureManager implements FeatureManager {
  /**
   * Creates an instance of PrimaryFeatureManager.
   * @param stateHelper - The state helper for getting server status.
   * @param logger - The logger to use. Defaults to a VoidLogger.
   * @param jsonParserId - The ID of the JSON parser to use. Defaults to "Native".
   * @param commitHash - The commit hash of the application. Defaults to an empty string.
   * @param appVersion - The version of the application. Defaults to an empty string.
   */
  constructor(
    private readonly stateHelper: StateHelper<"GetServerStatus">,
    private readonly logger: Logger = new VoidLogger(),
    private readonly jsonParserId: JsonParserId = "Native",
    private readonly commitHash: string = "",
    private readonly appVersion: string = "",
  ) {
    this.logger.log(
      `Application configured with ${jsonParserId} JSON parser, Version : ${appVersion}, Commit: ${commitHash}`,
    );
  }

  /**
   * Gets the version of the application.
   * @returns The version of the application.
   */
  getAppVersion(): string {
    return this.appVersion;
  }

  /**
   * Gets the commit hash of the application.
   * @returns The commit hash of the application.
   */
  getCommitHash(): string {
    return this.commitHash;
  }

  private get(): ServerStatus {
    const serverStatus = this.stateHelper.getOnce({ kind: "GetServerStatus" });
    if (!RemoteData.isSuccess(serverStatus)) {
      throw new Error("ServerStatus has not yet been set.");
    }
    return serverStatus.value;
  }

  /**
   * Gets the extensions of the ServerStatus object.
   * @private
   *
   * @returns The extensions of the ServerStatus object.
   */
  private getExtensions(): string[] {
    return this.get().extensions.map((extension) => extension.name);
  }

  /**
   * Checks if an extension is enabled in the ServerStatus object.
   * @private
   *
   * @param extension - The name of the extension.
   * @returns True if the extension is enabled, false otherwise.
   */
  private isExtensionEnabled(extension: string): boolean {
    return this.getExtensions().includes(extension);
  }

  /**
   * Checks if a feature is enabled in the ServerStatus object.
   * @private
   *
   * @param featureSlice - The slice of the feature.
   * @returns True if the feature is enabled, false otherwise.
   */
  private isFeaterEnabled(featureSlice: string): boolean {
    return this.get().features.some(
      (feature) => feature.slice === featureSlice && feature.value === true,
    );
  }

  /**
   * Gets the ID of the JSON parser.
   * @returns The ID of the JSON parser.
   */
  getJsonParser(): JsonParserId {
    return this.jsonParserId;
  }

  /**
   * Checks if the "support" extension is enabled.
   * @returns True if the "support" extension is enabled, false otherwise.
   */
  isSupportEnabled(): boolean {
    return this.isExtensionEnabled("support");
  }

  /**
   * Checks if the "lsm" extension is enabled.
   * @returns True if the "lsm" extension is enabled, false otherwise.
   */
  isLsmEnabled(): boolean {
    return this.isExtensionEnabled("lsm");
  }

  /**
   * Checks if the "resource-discovery" feature is enabled.
   * @returns True if the "resource-discovery" feature is enabled, false otherwise.
   */
  isResourceDiscoveryEnabled(): boolean {
    return this.isFeaterEnabled("core.resource");
  }

  /**
   * Checks if the "orderview"  is enabled.
   * @returns True if the "orderview" is enabled, false otherwise.
   */
  isOrderViewEnabled(): boolean {
    return this.isFeaterEnabled("lsm.order");
  }

  /**
   * Checks if the "composer" feature is enabled.
   * @returns True if the composer feature is enabled, false otherwise.
   */
  isComposerEnabled(): boolean {
    return this.isFeaterEnabled("ui.ui");
  }

  /**
   * Gets the major version of the server.
   * @returns The major version of the server.
   */
  getServerMajorVersion(): string {
    const serverStatus = this.get();
    return serverStatus.version.split(".")[0];
  }

  /**
   * Gets the full version of the server.
   * @returns The full version of the server.
   */
  getServerVersion(): string {
    const fullVersion = this.get().version;
    return fullVersion.indexOf(".dev") > -1
      ? fullVersion.substring(0, fullVersion.indexOf(".dev"))
      : fullVersion;
  }

  /**
   * Gets the edition of the server.
   * @returns The edition of the server.
   */
  getEdition(): string {
    return this.get().edition;
  }

  /**
   * Gets the license information of the server.
   * @returns The license information of the server, or undefined if not available.
   */
  getLicenseInformation(): StatusLicense | undefined {
    const serverStatus = this.get();
    const licenceInformation = serverStatus.slices.find(
      (slice) => slice.name === "license.license",
    );
    return licenceInformation?.status;
  }
}
