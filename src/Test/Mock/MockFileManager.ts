import { FileManager } from "@/Core";

export class MockFileManager implements FileManager {
  download(): void {
    return undefined;
  }
}
