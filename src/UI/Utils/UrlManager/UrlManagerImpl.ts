import { FeatureManager, Maybe, UrlManager } from "@/Core";

export class UrlManagerImpl implements UrlManager {
  private environment: Maybe.Type<string> = Maybe.none();

  constructor(
    private readonly featureManager: FeatureManager,
    private readonly baseUrl: string
  ) {}

  getDashboardUrl(environment: string): string {
    return `${this.baseUrl}/dashboard/#!/environment/${environment}`;
  }

  getDocumentationLink(): string {
    if (this.featureManager.getEdition().includes("Open Source")) {
      return `https://docs.inmanta.com/community/${this.featureManager.getServerVersion()}`;
    }
    return `https://docs.inmanta.com/inmanta-service-orchestrator/${this.featureManager.getServerMajorVersion()}/`;
  }

  getServerStatusUrl(): string {
    return `${this.baseUrl}/dashboard/#!/serverstatus`;
  }

  getApiUrl(): string {
    return this.baseUrl;
  }
}
