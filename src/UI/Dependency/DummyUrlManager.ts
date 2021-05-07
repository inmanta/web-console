import { UrlManager } from "@/Core";

export class DummyUrlManager implements UrlManager {
  getDashboardUrl(): string {
    throw new Error("Method not implemented.");
  }
  getResourceUrl(): string {
    throw new Error("Method not implemented.");
  }
  getModelVersionUrl(): string {
    throw new Error("Method not implemented.");
  }
  getCompileReportUrl(): string {
    throw new Error("Method not implemented.");
  }
}
