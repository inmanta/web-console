import { UrlManager } from "@/Core";

export class UrlManagerImpl implements UrlManager {
  private readonly versionPrefixLength = 3;

  constructor(
    private readonly baseUrl: string,
    private readonly environment: string
  ) {}

  getCompileReportUrl(): string {
    return `${this.baseUrl}/dashboard/#!/environment/${this.environment}/compilereport`;
  }

  getModelVersionUrl(version: string): string {
    return `${this.baseUrl}/dashboard/#!/environment/${this.environment}/version/${version}`;
  }

  getResourceUrl(resourceId: string): string {
    const indexOfVersionSeparator = resourceId.lastIndexOf(",");
    const resourceName = resourceId.substring(0, indexOfVersionSeparator);
    const version = resourceId.substring(
      indexOfVersionSeparator + this.versionPrefixLength,
      resourceId.length
    );

    return `${this.baseUrl}/dashboard/#!/environment/${
      this.environment
    }/version/${version}/${encodeURI(resourceName).replace(/\//g, "~2F")}`;
  }

  getDashboardUrl(): string {
    return `/dashboard/#!/environment/${this.environment}`;
  }
}
