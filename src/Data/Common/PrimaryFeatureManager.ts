import { FeatureManager, RemoteData, ServerStatus, StateHelper } from "@/Core";

export class PrimaryFeatureManager implements FeatureManager {
  constructor(private readonly stateHelper: StateHelper<"GetServerStatus">) {}

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
