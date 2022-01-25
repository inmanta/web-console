export interface FileManager {
  download(blob: Blob, filename: string): void;
}
