import {
  ApiHelper,
  Dictionary,
  Maybe,
  SubscriptionHelper,
  Timer,
  UpdateHandler,
} from "@/Core";
import { DataModel, Subject } from "./DataModel";

export class SubscriptionHelperImpl
  implements SubscriptionHelper<Subject, string, DataModel> {
  constructor(
    private readonly DELAY: number,
    private readonly apiHelper: ApiHelper<Subject, string, DataModel>,
    private readonly intervals: Dictionary<Timer>
  ) {}

  subscribeTo(
    subject: Subject,
    updateHandler: UpdateHandler<string, DataModel>
  ): boolean {
    if (!this.intervals.isFree(subject.id)) return false;

    const intervalId = setInterval(async () => {
      const data = await this.apiHelper.getData(subject);
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
