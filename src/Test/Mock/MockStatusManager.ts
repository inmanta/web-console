import { ServerStatus, StatusManager } from "@/Core";

export class MockStatusManager implements StatusManager {
  getServerStatus(): ServerStatus {
    return {} as ServerStatus;
  }

  getServerVersion(): string {
    return "4";
  }

  isLsmEnabled(): boolean {
    return true;
  }

  setServerStatus(): void {
    return undefined;
  }
}
