export interface FeatureManager {
  isLsmEnabled(): boolean;
  isSupportEnabled(): boolean;
  getServerVersion(): string;
}
