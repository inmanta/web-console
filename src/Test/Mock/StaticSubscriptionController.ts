import { SubscriptionController } from "@/Core";

export class StaticSubscriptionController implements SubscriptionController {
  private state: Record<string, () => void> = {};

  subscribeTo(id: string, handler: () => void): boolean {
    this.state[id] = handler;
    handler();
    return true;
  }

  unsubscribeFrom(id: string): void {
    delete this.state[id];
  }

  executeAll(): void {
    Object.keys(this.state).forEach((key) => {
      this.state[key]();
    });
  }
}
