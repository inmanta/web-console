import { UrlManager } from "@/Core";

export class DummyUrlManager implements UrlManager {
  setEnvironment(): void {
    throw new Error("Method not implemented.");
  }
  getVersionedResourceUrl(): string {
    throw new Error("Method not implemented.");
  }
  getModelVersionUrl(): string {
    throw new Error("Method not implemented.");
  }
  getServerStatusUrl(): string {
    throw new Error("Method not implemented.");
  }
}
