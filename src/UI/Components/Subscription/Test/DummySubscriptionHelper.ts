import { ApiHelper, SubscriptionHelper, UpdateHandler } from "@/Core";
import { Subject, DataModel } from "../DataModel";

export class DummySubscriptionHelper
  implements SubscriptionHelper<Subject, string, DataModel> {
  private state: Record<string, () => void> = {};

  constructor(
    private readonly apiHelper: ApiHelper<Subject, string, DataModel>
  ) {}

  subscribeTo(
    subject: Subject,
    updateHandler: UpdateHandler<string, DataModel>
  ): boolean {
    const handler = async () => {
      const result = await this.apiHelper.getData(subject);
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
