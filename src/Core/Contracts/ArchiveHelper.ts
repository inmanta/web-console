/**
 * Download zip file based on base64 string
 */
export interface ArchiveHelper {
  /**
   * Generates a blob based on the provided string
   * @param value a base64 encoded string of zip archive
   */
  generateBlob(value: string): Promise<Blob>;

  /**
   * Triggers the browser download action
   * @param blob file blob
   */
  triggerDownload(blob: Blob): void;
}
