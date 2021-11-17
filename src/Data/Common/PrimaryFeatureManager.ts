import { FeatureManager, RemoteData, StateHelper } from "@/Core";

export class PrimaryFeatureManager implements FeatureManager {
  constructor(private readonly stateHelper: StateHelper<"GetServerStatus">) {}

  isLsmEnabled(): boolean {
    const serverStatus = this.stateHelper.getOnce({ kind: "GetServerStatus" });
    if (!RemoteData.isSuccess(serverStatus)) {
      throw new Error("ServerStatus has not yet been set.");
    }
    return (
      typeof serverStatus.value.extensions.find(
        (extension) => extension.name === "lsm"
      ) !== "undefined"
    );
  }

  getServerVersion(): string {
    const serverStatus = this.stateHelper.getOnce({ kind: "GetServerStatus" });
    if (!RemoteData.isSuccess(serverStatus)) {
      throw new Error("ServerStatus has not yet been set.");
    }
    return serverStatus.value.version.split(".")[0];
  }
}
