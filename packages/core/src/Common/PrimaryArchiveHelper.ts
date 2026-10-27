import { ArchiveHelper } from "@inmanta/web-console-core";

interface FileManager {
  download(blob: Blob, filename: string): void;
}

export class PrimaryArchiveHelper implements ArchiveHelper {
  constructor(private readonly fileManager: FileManager) {}

  triggerDownload(blob: Blob): void {
    this.fileManager.download(blob, "support-archive.zip");
  }
}
