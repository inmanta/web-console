import { ServerStatus } from "@/Core/Domain";

export interface StatusManager {
  setServerStatus(serverStatus: ServerStatus): void;
  getServerStatus(): ServerStatus;
  isLsmEnabled(): boolean;
  getServerVersion(): string;
}
