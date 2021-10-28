export interface UrlManager {
  setEnvironment(environment: string): void;
  getModelVersionUrl(version: string): string;
  getVersionedResourceUrl(resourceId: string, version: string): string;
  getServerStatusUrl(): string;
}
