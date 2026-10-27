import { saveAs } from "file-saver";
import { FileManager } from "@inmanta/web-console-core";

export class PrimaryFileManager implements FileManager {
  download(blob: Blob, filename: string): void {
    saveAs(blob, filename);
  }
}
