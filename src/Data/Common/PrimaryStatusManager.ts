import { StatusManager, Maybe, ServerStatus } from "@/Core";

export class PrimaryStatusManager implements StatusManager {
  private serverStatus: Maybe.Type<ServerStatus> = Maybe.none();

  setServerStatus(serverStatus: ServerStatus): void {
    this.serverStatus = Maybe.some(serverStatus);
  }

  getServerStatus(): ServerStatus {
    if (Maybe.isNone(this.serverStatus)) {
      throw new Error("ServerStatus has not yet been set.");
    }
    return this.serverStatus.value;
  }

  isLsmEnabled(): boolean {
    if (Maybe.isNone(this.serverStatus)) {
      throw new Error("ServerStatus has not yet been set.");
    }
    return (
      typeof this.serverStatus.value.extensions.find(
        (extension) => extension.name === "lsm"
      ) !== "undefined"
    );
  }

  getServerVersion(): string {
    if (Maybe.isNone(this.serverStatus)) {
      throw new Error("ServerStatus has not yet been set.");
    }
    return this.serverStatus.value.version.split(".")[0];
  }
}
