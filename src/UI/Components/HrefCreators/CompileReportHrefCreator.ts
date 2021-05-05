import { HrefCreator } from "./HrefCreator";

export class CompileReportHrefCreator implements HrefCreator {
  constructor(private readonly environmentId: string) {}

  create(): string {
    const baseUrl = process.env.API_BASEURL ? process.env.API_BASEURL : "";
    return `${baseUrl}/dashboard/#!/environment/${this.environmentId}/compilereport`;
  }
}
