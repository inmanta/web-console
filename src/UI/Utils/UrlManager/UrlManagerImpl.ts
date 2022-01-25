import { FeatureManager, Maybe, UrlManager } from "@/Core";

export class UrlManagerImpl implements UrlManager {
  private environment: Maybe.Type<string> = Maybe.none();

  constructor(
    private readonly featureManager: FeatureManager,
    private readonly baseUrl: string,
    environment?: string
  ) {
    if (typeof environment === "undefined") return;
    this.environment = Maybe.some(environment);
  }

  getDashboardUrl(environment: string): string {
    return `${this.baseUrl}/dashboard/#!/environment/${environment}`;
  }

  getDocumentationLink(): string {
    if (this.featureManager.getEdition().includes("Open Source")) {
      return `https://docs.inmanta.com/community/${this.featureManager.getServerVersion()}`;
    }
    return `https://docs.inmanta.com/inmanta-service-orchestrator/${this.featureManager.getServerMajorVersion()}/`;
  }

  setEnvironment(environment: string): void {
    this.environment = Maybe.some(environment);
  }

  private getEnvironment(): string {
    if (Maybe.isSome(this.environment)) return this.environment.value;
    throw new Error("Environment not set");
  }

  getServerStatusUrl(): string {
    return `${this.baseUrl}/dashboard/#!/serverstatus`;
  }

  getApiUrl(): string {
    return this.baseUrl;
  }
}
