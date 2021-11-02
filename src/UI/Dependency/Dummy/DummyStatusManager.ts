import { ServerStatus, StatusManager } from "@/Core";

export class DummyStatusManager implements StatusManager {
  getServerStatus(): ServerStatus {
    throw new Error("Method not implemented.");
  }
  getServerVersion(): string {
    throw new Error("Method not implemented.");
  }
  setServerStatus(): void {
    throw new Error("Method not implemented.");
  }
  isLsmEnabled(): boolean {
    throw new Error("Method not implemented.");
  }
}
