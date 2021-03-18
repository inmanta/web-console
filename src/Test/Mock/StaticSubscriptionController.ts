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

  refresh(id: string): boolean {
    const handler = this.state[id];
    if (typeof handler === "undefined") {
      throw new Error(`No handler found for id ${id}`);
    }
    handler();
    return true;
  }

  replace(id: string, handler: () => void): void {
    const old = this.state[id];
    if (typeof old === "undefined") {
      throw new Error(`No handler found for id ${id}`);
    }
    this.state[id] = handler;
    handler();
  }

  executeAll(): void {
    Object.keys(this.state).forEach((key) => {
      this.state[key]();
    });
  }
}
