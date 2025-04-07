import { saveAs } from "file-saver";
import { FileManager } from "@/Core";

export class PrimaryFileManager implements FileManager {
  download(blob: Blob, filename: string): void {
    saveAs(blob, filename);
  }
}
