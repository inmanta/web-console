import { UrlManager } from "@/Core";

export class DummyUrlManager implements UrlManager {
  getApiUrl(): string {
    throw new Error("Method not implemented.");
  }
  getDocumentationLink(): string {
    throw new Error("Method not implemented.");
  }
  getLSMAPILink(): string {
    throw new Error("Method not implemented.");
  }
  getGeneralAPILink(): string {
    throw new Error("Method not implemented.");
  }
  setEnvironment(): void {
    throw new Error("Method not implemented.");
  }
}
