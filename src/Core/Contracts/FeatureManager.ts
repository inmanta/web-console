export interface FeatureManager {
  isLsmEnabled(): boolean;
  getServerVersion(): string;
}
