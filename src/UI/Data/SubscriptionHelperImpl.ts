import {
  Maybe,
  SubscriptionHelper,
  Subject,
  UpdateHandler,
  Dictionary,
  Timer,
  ApiHelper,
  ResourceModel,
} from "@/Core";

export class SubscriptionHelperImpl
  implements SubscriptionHelper<Subject, string, ResourceModel[]> {
  constructor(
    private readonly DELAY: number,
    private readonly apiHelper: ApiHelper<Subject, string, ResourceModel[]>,
    private readonly intervals: Dictionary<Timer>
  ) {}

  subscribeTo(
    subject: Subject,
    updateHandler: UpdateHandler<string, ResourceModel[]>
  ): boolean {
    if (!this.intervals.isFree(subject.query.id)) return false;
    const handler = async () => {
      const data = await this.apiHelper.getData(subject);
      updateHandler(data);
    };
    handler();
    const intervalId = setInterval(handler, this.DELAY);
    this.intervals.set(subject.query.id, intervalId);
    return true;
  }

  unsubscribeFrom(subject: Subject): void {
    const intervalId = this.intervals.get(subject.query.id);
    if (Maybe.isNone(intervalId)) return;
    clearInterval(intervalId.value);
    this.intervals.drop(subject.query.id);
  }
}
