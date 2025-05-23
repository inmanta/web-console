import { JsonParser } from "@/Core";

export class NativeJsonParser implements JsonParser {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parse(text: string): any {
    return JSON.parse(text);
  }
}
