import { ServerStatus } from "@/Core/Domain";

export interface FeatureManager {
  isLsmEnabled(): boolean;
  setServerStatus(serverStatus: ServerStatus): void;
}
