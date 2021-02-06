import { Maybe } from "@/Core";
import { Dictionary, Timer } from "./Interfaces";

export class IntervalsDictionary implements Dictionary<Timer> {
  private state: Record<string, { value: Timer }> = {};

  get(key: string): Maybe.Type<Timer> {
    const lookup = this.state[key];
    if (typeof lookup === "undefined") return Maybe.none();
    return Maybe.some(lookup.value);
  }

  set(key: string, value: Timer): boolean {
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
}
