export interface BaseUrlManager {
  /**
   * @returns pathname (includes anchor, excludes origin)
   */
  getBasePathname(): string;

  /**
   * @param forcedUrl for development purposes, a different url can be provided
   * @returns url (includes origin and pathname, excludes anchor)
   */
  getBaseUrl(forcedUrl?: string): string;
}
