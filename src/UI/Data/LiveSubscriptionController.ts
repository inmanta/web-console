import { Maybe, Dictionary, Timer, SubscriptionController } from "@/Core";

export class LiveSubscriptionController implements SubscriptionController {
  constructor(
    private readonly DELAY: number,
    private readonly intervals: Dictionary<Timer>
  ) {}

  subscribeTo(id: string, handler: () => void): boolean {
    if (!this.intervals.isFree(id)) return false;
    handler();
    const intervalId = setInterval(handler, this.DELAY);
    this.intervals.set(id, intervalId);
    return true;
  }

  unsubscribeFrom(id: string): void {
    const intervalId = this.intervals.get(id);
    if (Maybe.isNone(intervalId)) return;
    clearInterval(intervalId.value);
    this.intervals.drop(id);
  }
}
