import { Maybe, Dictionary, Interval, SubscriptionController } from "@/Core";

export class LiveSubscriptionController implements SubscriptionController {
  constructor(
    private readonly DELAY: number,
    private readonly intervals: Dictionary<Interval>
  ) {}

  subscribeTo(id: string, handler: () => void): boolean {
    if (!this.intervals.isFree(id)) return false;
    handler();
    const timerId = setInterval(handler, this.DELAY);
    this.intervals.set(id, { timerId, handler });
    return true;
  }

  unsubscribeFrom(id: string): void {
    const interval = this.intervals.get(id);
    if (Maybe.isNone(interval)) return;
    clearInterval(interval.value.timerId);
    this.intervals.drop(id);
  }

  refresh(id: string): boolean {
    const interval = this.intervals.get(id);
    if (Maybe.isNone(interval)) return false;
    this.unsubscribeFrom(id);
    this.subscribeTo(id, interval.value.handler);
    return true;
  }
}
