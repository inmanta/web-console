export interface UrlManager {
  setEnvironment(environment: string): void;
  getServerStatusUrl(): string;
  getDashboardUrl(environment: string): string;
  getDocumentationLink(): string;
  getApiUrl(): string;
}
