import { Maybe } from "@/Core";
import {
  ApiHelper,
  Dictionary,
  Subject,
  SubscriptionHelper,
  UpdateHandler,
  Timer,
} from "./Interfaces";

export class SubscriptionHelperImpl implements SubscriptionHelper {
  constructor(
    private readonly DELAY: number,
    private readonly apiHelper: ApiHelper,
    private readonly intervals: Dictionary<Timer>
  ) {}

  subscribeTo(subject: Subject, updateHandler: UpdateHandler): boolean {
    if (!this.intervals.isFree(subject.id)) return false;

    const intervalId = setInterval(async () => {
      const data = await this.apiHelper.getData(subject.id);
      updateHandler(data);
    }, this.DELAY);
    this.intervals.set(subject.id, intervalId);
    return true;
  }

  unsubscribeFrom(subject: Subject): void {
    const intervalId = this.intervals.get(subject.id);
    if (Maybe.isNone(intervalId)) return;
    clearInterval(intervalId.value);
    this.intervals.drop(subject.id);
  }
}
