export interface BaseUrlManager {
  getConsoleBaseUrl(): string;
  getBaseUrl(forcedUrl?: string): string;
}
