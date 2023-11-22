import { FeatureManager, UrlManager } from "@/Core";

export class UrlManagerImpl implements UrlManager {
  constructor(
    private readonly featureManager: FeatureManager,
    private readonly baseUrl: string,
  ) {}

  getDocumentationLink(): string {
    if (this.featureManager.getEdition().includes("Open Source")) {
      return `https://docs.inmanta.com/community/${this.featureManager.getServerVersion()}`;
    }
    return `https://docs.inmanta.com/inmanta-service-orchestrator/${this.featureManager.getServerMajorVersion()}/`;
  }

  getGeneralAPILink(): string {
    return `${this.baseUrl}/api/v2/docs`;
  }

  getLSMAPILink(environment: string): string {
    return `${this.baseUrl}/lsm/v1/service_catalog_docs?environment=${environment}`;
  }

  getApiUrl(): string {
    return this.baseUrl;
  }
}
