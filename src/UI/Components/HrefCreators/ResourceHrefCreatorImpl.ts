import { HrefCreator } from "./HrefCreator";

export class ResourceHrefCreatorImpl implements HrefCreator {
  private readonly versionPrefixLength = 3;

  constructor(private readonly environmentId: string) {}

  create(id: string): string {
    const indexOfVersionSeparator = id.lastIndexOf(",");
    const resourceName = id.substring(0, indexOfVersionSeparator);
    const version = id.substring(
      indexOfVersionSeparator + this.versionPrefixLength,
      id.length
    );
    const baseUrl = process.env.API_BASEURL ? process.env.API_BASEURL : "";
    return `${baseUrl}/dashboard/#!/environment/${
      this.environmentId
    }/version/${version}/${encodeURI(resourceName).replace(/\//g, "~2F")}`;
  }
}
