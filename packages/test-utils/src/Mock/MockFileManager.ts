import { FileManager } from "@inmanta/web-console-core";

export class MockFileManager implements FileManager {
  download(): void {
    return undefined;
  }
}
