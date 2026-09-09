/**
 * The Dictionary stores key-value data.
 */
export interface Dictionary<Value> {
  get(key: string): Value | undefined;
  set(key: string, value: Value): boolean;
  isFree(key: string): boolean;
  isEmpty(): boolean;
  drop(key: string): void;
  toObject(): Record<string, Value>;
}
