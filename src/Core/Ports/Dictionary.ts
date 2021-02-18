import { Maybe } from "@/Core/Language";

/**
 * The Dictionary stores key-value data.
 */
export interface Dictionary<Value> {
  get(key: string): Maybe.Type<Value>;
  set(key: string, value: Value): boolean;
  isFree(key: string): boolean;
  drop(key: string): void;
}
