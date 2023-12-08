export interface UrlManager {
  getDocumentationLink(): string;
  getLSMAPILink(environment: string): string;
  getGeneralAPILink(): string;
  getApiUrl(): string;
}
