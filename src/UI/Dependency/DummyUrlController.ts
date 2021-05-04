import { UrlController } from "@/Core";

export class DummyUrlController implements UrlController {
  getCompileReportUrl(): string {
    throw new Error("Method not implemented.");
  }
}
