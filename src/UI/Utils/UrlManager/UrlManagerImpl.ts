import { OrchestratorProvider, UrlManager } from "@/Core";

/**
 * This class is used to manage the URLs of the application.
 *
 * @returns <UrlManager> UrlManagerImpl
 */
export class UrlManagerImpl implements UrlManager {
  constructor(
    private readonly orchestratorProvider: OrchestratorProvider,
    private readonly baseUrl: string
  ) {}

  getDocumentationLink(): string {
    if (this.orchestratorProvider.getEdition().includes("Open Source")) {
      return `https://docs.inmanta.com/community/${this.orchestratorProvider.getServerVersion()}`;
    }

    return `https://docs.inmanta.com/inmanta-service-orchestrator/${this.orchestratorProvider.getServerMajorVersion()}/`;
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
