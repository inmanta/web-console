import JSZip from "jszip";
import { ArchiveHelper } from "@/Core";

interface FileManager {
  download(blob: Blob, filename: string): void;
}

export class PrimaryArchiveHelper implements ArchiveHelper {
  constructor(private readonly fileManager: FileManager) {}

  async generateBlob(value: string): Promise<Blob> {
    const zip = await JSZip.loadAsync(value, { base64: true });
    return await zip.generateAsync({ type: "blob" });
  }

  triggerDownload(blob: Blob): void {
    this.fileManager.download(blob, "support-archive.zip");
  }
}
