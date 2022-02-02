import { Logger } from "@/Core";

export class VoidLogger implements Logger {
  log(): void {
    return undefined;
  }
}
