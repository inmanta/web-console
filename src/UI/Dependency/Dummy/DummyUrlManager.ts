import { UrlManager } from "@/Core";

export class DummyUrlManager implements UrlManager {
  getApiUrl(): string {
    throw new Error("Method not implemented.");
  }
  getDocumentationLink(): string {
    throw new Error("Method not implemented.");
  }
  getDashboardUrl(): string {
    throw new Error("Method not implemented.");
  }
  setEnvironment(): void {
    throw new Error("Method not implemented.");
  }
  getServerStatusUrl(): string {
    throw new Error("Method not implemented.");
  }
}
