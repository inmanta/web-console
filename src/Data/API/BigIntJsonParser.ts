import JsonBigInt from "json-bigint";
import { JsonParser } from "@/Core";

export class BigIntJsonParser implements JsonParser {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parse(text: string): any {
    return JsonBigInt({ strict: true, storeAsString: true }).parse(text);
  }
}
