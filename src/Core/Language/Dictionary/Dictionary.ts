import * as Maybe from "@/Core/Language/Maybe";

/**
 * The Dictionary stores key-value data.
 */
export interface Dictionary<Value> {
  get(key: string): Maybe.Type<Value>;
  set(key: string, value: Value): boolean;
  isFree(key: string): boolean;
  isEmpty(): boolean;
  drop(key: string): void;
  toObject(): Record<string, Value>;
}
