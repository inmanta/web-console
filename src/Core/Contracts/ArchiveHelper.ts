/**
 * Download zip file based on base64 string
 */
export interface ArchiveHelper {
  /**
   * Triggers the browser download action
   * @param blob file blob
   */
  triggerDownload(blob: Blob): void;
}
