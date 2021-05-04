import { UrlController } from "@/Core";

export class UrlControllerImpl implements UrlController {
  constructor(
    private readonly baseUrl: string,
    private readonly environment: string
  ) {}
  getCompileReportUrl(): string {
    return `${this.baseUrl}/dashboard/#!/environment/${this.environment}/compilereport`;
  }
}
