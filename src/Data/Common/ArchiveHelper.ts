import { saveAs } from "file-saver";
import JSZip from "jszip";

/**
 * Download zip file based on base64 string
 */
export class ArchiveHelper {
  /**
   * Generates a blob based on the provided string
   * @param value a base64 encoded string of zip archive
   */
  async generateBlob(value: string): Promise<Blob> {
    const zip = await JSZip.loadAsync(value, { base64: true });
    return await zip.generateAsync({ type: "blob" });
  }

  /**
   * Triggers the browser download action
   * @param blob file blob
   */
  triggerDownload(blob: Blob): void {
    saveAs(blob, "support-archive.zip");
  }
}
