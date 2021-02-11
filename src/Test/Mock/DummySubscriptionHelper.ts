import {
  ApiHelper,
  ResourceModel,
  Subject,
  SubscriptionHelper,
  UpdateHandler,
} from "@/Core";

export class DummySubscriptionHelper
  implements SubscriptionHelper<Subject, string, ResourceModel[]> {
  private state: Record<string, () => void> = {};

  constructor(
    private readonly apiHelper: ApiHelper<Subject, string, ResourceModel[]>
  ) {}

  subscribeTo(
    subject: Subject,
    updateHandler: UpdateHandler<string, ResourceModel[]>
  ): boolean {
    const handler = async () => {
      const result = await this.apiHelper.getData(subject);
      updateHandler(result);
    };
    this.state[subject.query.id] = handler;
    handler();
    return true;
  }

  unsubscribeFrom(subject: Subject): void {
    delete this.state[subject.query.id];
  }

  executeAll(): void {
    Object.keys(this.state).forEach((key) => {
      this.state[key]();
    });
  }
}
