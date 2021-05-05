import { HrefCreator } from "./HrefCreator";

export class ModelVersionHrefCreator implements HrefCreator {
  constructor(private readonly environmentId: string) {}

  create(version: string): string {
    const baseUrl = process.env.API_BASEURL ? process.env.API_BASEURL : "";
    return `${baseUrl}/dashboard/#!/environment/${this.environmentId}/version/${version}`;
  }
}
