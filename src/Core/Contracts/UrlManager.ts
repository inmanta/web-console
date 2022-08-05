export interface UrlManager {
  getDashboardUrl(environment: string): string;
  getDocumentationLink(): string;
  getApiUrl(): string;
}
