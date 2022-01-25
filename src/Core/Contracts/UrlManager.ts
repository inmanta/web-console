export interface UrlManager {
  getServerStatusUrl(): string;
  getDashboardUrl(environment: string): string;
  getDocumentationLink(): string;
  getApiUrl(): string;
}
