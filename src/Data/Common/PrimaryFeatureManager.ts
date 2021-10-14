import { FeatureManager, Maybe, ServerStatus } from "@/Core";

export class PrimaryFeatureManager implements FeatureManager {
  private serverStatus: Maybe.Type<ServerStatus> = Maybe.none();
  setServerStatus(serverStatus: ServerStatus): void {
    this.serverStatus = Maybe.some(serverStatus);
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
}
