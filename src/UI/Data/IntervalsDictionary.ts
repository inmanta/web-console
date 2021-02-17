import { Maybe, Dictionary, TimerId } from "@/Core";

/**
 * The IntervalsDictionary stores TimerIds.
 * These are just numbers representing registered interval callbacks.
 */
export class IntervalsDictionary implements Dictionary<TimerId> {
  private state: Record<string, { value: TimerId }> = {};

  get(key: string): Maybe.Type<TimerId> {
    const lookup = this.state[key];
    if (typeof lookup === "undefined") return Maybe.none();
    return Maybe.some(lookup.value);
  }

  set(key: string, value: TimerId): boolean {
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
