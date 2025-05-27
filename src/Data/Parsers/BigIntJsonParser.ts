import { JsonParser } from "@/Core";
import JsonBigInt from "./JsonBigInt";

export class BigIntJsonParser implements JsonParser {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parse(text: string): any {
    return JsonBigInt({ strict: true, useNativeBigInt: true }).parse(text);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stringify(text: any): string {
    return JsonBigInt({ strict: true, useNativeBigInt: true }).stringify(text);
  }
}
