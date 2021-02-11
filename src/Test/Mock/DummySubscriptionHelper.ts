import {
  ApiHelper,
  Subject,
  SubscriptionHelper,
  UpdateHandler,
} from "@/UI/Components/Subscription/Interfaces";

export class DummySubscriptionHelper implements SubscriptionHelper {
  private state: Record<string, () => void> = {};

  constructor(private readonly apiHelper: ApiHelper) {}

  subscribeTo(subject: Subject, updateHandler: UpdateHandler): boolean {
    const handler = async () => {
      const result = await this.apiHelper.getData(subject.id);
      updateHandler(result);
    };
    this.state[subject.id] = handler;
    handler();
    return true;
  }

  unsubscribeFrom(subject: Subject): void {
    delete this.state[subject.id];
  }

  executeAll(): void {
    Object.keys(this.state).forEach((key) => {
      this.state[key]();
    });
  }
}
