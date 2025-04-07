import { Formatter } from "@/Core";

export class JsonFormatter implements Formatter<unknown> {
  format(source: unknown): string {
    return JSON.stringify(source, null, 4);
  }
}
