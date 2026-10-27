import { Formatter } from "@inmanta/web-console-core";

export class JsonFormatter implements Formatter<unknown> {
  format(source: unknown): string {
    return JSON.stringify(source, null, 2);
  }
}
