import { Maybe, UrlManager } from "@/Core";

export class UrlManagerImpl implements UrlManager {
  private readonly versionPrefixLength = 3;
  private environment: Maybe.Type<string> = Maybe.none();

  constructor(private readonly baseUrl: string, environment?: string) {
    if (typeof environment === "undefined") return;
    this.environment = Maybe.some(environment);
  }

  setEnvironment(environment: string): void {
    this.environment = Maybe.some(environment);
  }

  private getEnvironment(): string {
    if (Maybe.isSome(this.environment)) return this.environment.value;
    throw new Error("Environment not set");
  }

  getCompileReportUrl(): string {
    return `${
      this.baseUrl
    }/dashboard/#!/environment/${this.getEnvironment()}/compilereport`;
  }

  getModelVersionUrl(version: string): string {
    return `${
      this.baseUrl
    }/dashboard/#!/environment/${this.getEnvironment()}/version/${version}`;
  }

  getResourceUrl(resourceId: string): string {
    const indexOfVersionSeparator = resourceId.lastIndexOf(",");
    const resourceName = resourceId.substring(0, indexOfVersionSeparator);
    const version = resourceId.substring(
      indexOfVersionSeparator + this.versionPrefixLength,
      resourceId.length
    );

    return `${
      this.baseUrl
    }/dashboard/#!/environment/${this.getEnvironment()}/version/${version}/${encodeURI(
      resourceName
    ).replace(/\//g, "~2F")}`;
  }
}
