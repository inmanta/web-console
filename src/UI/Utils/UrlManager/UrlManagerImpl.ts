import { StatusManager, Maybe, UrlManager } from "@/Core";

export class UrlManagerImpl implements UrlManager {
  private environment: Maybe.Type<string> = Maybe.none();

  constructor(
    private readonly statusManager: StatusManager,
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
    return `https://docs.inmanta.com/inmanta-service-orchestrator/${this.statusManager.getServerVersion()}/`;
  }

  setEnvironment(environment: string): void {
    this.environment = Maybe.some(environment);
  }

  private getEnvironment(): string {
    if (Maybe.isSome(this.environment)) return this.environment.value;
    throw new Error("Environment not set");
  }

  getModelVersionUrl(version: string): string {
    return `${
      this.baseUrl
    }/dashboard/#!/environment/${this.getEnvironment()}/version/${version}`;
  }

  getVersionedResourceUrl(resourceId: string, version: string): string {
    return `${
      this.baseUrl
    }/dashboard/#!/environment/${this.getEnvironment()}/version/${version}/${encodeURI(
      resourceId
    ).replace(/\//g, "~2F")}`;
  }

  getServerStatusUrl(): string {
    return `${this.baseUrl}/dashboard/#!/serverstatus`;
  }

  getApiUrl(): string {
    return this.baseUrl;
  }
}
