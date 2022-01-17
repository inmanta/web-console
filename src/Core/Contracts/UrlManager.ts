export interface UrlManager {
  setEnvironment(environment: string): void;
  getVersionedResourceUrl(resourceId: string, version: string): string;
  getServerStatusUrl(): string;
  getDashboardUrl(environment: string): string;
  getDocumentationLink(): string;
  getApiUrl(): string;
}
