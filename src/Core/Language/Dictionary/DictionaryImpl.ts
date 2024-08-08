import * as Maybe from "@/Core/Language/Maybe";
import { Dictionary } from "./Dictionary";

export class DictionaryImpl<Value> implements Dictionary<Value> {
  private state: Record<string, { value: Value }> = {};

  get(key: string): Maybe.Type<Value> {
    const lookup = this.state[key];
    if (typeof lookup === "undefined") {
      console.error(`key ${key} could not be found in dictionary`);
      return Maybe.none();
    }
    return Maybe.some(lookup.value);
  }

  set(key: string, value: Value): boolean {
    if (!this.isFree(key)) return false;
    this.state[key] = { value };
    return true;
  }

  drop(key: string): void {
    delete this.state[key];
  }

  isFree(key: string): boolean {
    return typeof this.state[key] === "undefined";
  }

  isEmpty(): boolean {
    return Object.keys(this.state).length <= 0;
  }

  toObject(): Record<string, Value> {
    return Object.entries(this.state).reduce<Record<string, Value>>(
      (acc, [id, { value }]) => {
        acc[id] = value;
        return acc;
      },
      {},
    );
  }
}
