export interface UrlManager {
  getCompileReportUrl(): string;
  getModelVersionUrl(version: string): string;
  getResourceUrl(resourceId: string): string;
}
