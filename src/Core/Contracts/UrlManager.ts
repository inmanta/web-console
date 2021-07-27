export interface UrlManager {
  setEnvironment(environment: string): void;
  getCompileReportUrl(): string;
  getModelVersionUrl(version: string): string;
  getResourceUrl(resourceId: string): string;
  getVersionedResourceUrl(resourceId: string, version: string): string;
}
