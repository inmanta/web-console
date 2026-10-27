import { ArchiveHelper } from "@inmanta/web-console-core";

export class DummyArchiveHelper implements ArchiveHelper {
  generateBlob(): Promise<Blob> {
    throw new Error("Method not implemented.");
  }
  triggerDownload(): void {
    throw new Error("Method not implemented.");
  }
}
