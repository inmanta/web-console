import {
  FeatureManager,
  JsonParserId,
  Logger,
  RemoteData,
  ServerStatus,
  StateHelper,
} from "@/Core";
import { VoidLogger } from "./VoidLogger";

export class PrimaryFeatureManager implements FeatureManager {
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

  getAppVersion(): string {
    return this.appVersion;
  }

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

  private getExtensions(): string[] {
    return this.get().extensions.map((extension) => extension.name);
  }

  private isExtensionEnabled(extension: string): boolean {
    return this.getExtensions().includes(extension);
  }

  getJsonParser(): JsonParserId {
    return this.jsonParserId;
  }

  isSupportEnabled(): boolean {
    return this.isExtensionEnabled("support");
  }

  isLsmEnabled(): boolean {
    return this.isExtensionEnabled("lsm");
  }

  getServerMajorVersion(): string {
    const serverStatus = this.get();
    return serverStatus.version.split(".")[0];
  }

  getServerVersion(): string {
    const fullVersion = this.get().version;
    return fullVersion.indexOf(".dev") > -1
      ? fullVersion.substring(0, fullVersion.indexOf(".dev"))
      : fullVersion;
  }

  getEdition(): string {
    return this.get().edition;
  }
}
