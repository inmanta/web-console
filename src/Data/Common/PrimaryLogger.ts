import { Logger } from "@/Core";

export class PrimaryLogger implements Logger {
  log(text: string): void {
    console.info(`[inmanta-web-console] ${text}`);
  }
}
