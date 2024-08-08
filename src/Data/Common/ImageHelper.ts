import { Maybe } from "@/Core";

interface FileSize {
  size: number;
}

interface FileType {
  type: string;
}

export class ImageHelper {
  static validateFile(file: FileSize & FileType): Maybe.Maybe<"TYPE" | "SIZE"> {
    if (!this.isFileTypeValid(file)) return Maybe.some("TYPE");
    if (!this.isFileSizeValid(file)) return Maybe.some("SIZE");
    return Maybe.none();
  }

  static formatFileSize(file: FileSize): string {
    return `${Math.round(file.size / 1000)} KB`;
  }

  private static isFileTypeValid(file: FileType): boolean {
    return ["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(
      file.type,
    );
  }

  private static isFileSizeValid(file: FileSize): boolean {
    return file.size <= 64000;
  }

  static getExtensionFromDataUrl(dataUrl: string): string | null {
    return this.getExtensionFromMimeType(this.getMimeTypeFromDataUrl(dataUrl));
  }

  private static getExtensionFromMimeType(mimeType: string): string | null {
    switch (mimeType) {
      case "image/webp":
        return "webp";
      case "image/jpeg":
        return "jpeg";
      case "image/svg+xml":
        return "svg";
      case "image/png":
        return "png";
      default:
        return null;
    }
  }

  private static getMimeTypeFromDataUrl(dataUrl: string): string {
    return dataUrl.substring(dataUrl.indexOf(":") + 1, dataUrl.indexOf(";"));
  }

  static stripDataScheme(dataUrl: string): string {
    return dataUrl === "" ? "" : dataUrl.split("data:")[1];
  }

  static addDataScheme(dataUrl: string): string {
    return dataUrl.includes("data:") ? dataUrl : `data:${dataUrl}`;
  }
}
