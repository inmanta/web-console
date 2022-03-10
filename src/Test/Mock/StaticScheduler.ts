import { Scheduler, Task } from "@/Core";

export class StaticScheduler implements Scheduler {
  private state: Record<string, Task> = {};

  getIds(): string[] {
    return Object.keys(this.state);
  }

  register(id: string, task: Task<unknown>): void {
    this.state[id] = task;
  }

  unregister(id: string): void {
    delete this.state[id];
  }

  async executeAll(): Promise<void> {
    const list = Object.entries(this.state);
    const promises = list.map(([, task]) => task.effect());
    const results = await Promise.all(promises);

    results.forEach((result, index) => {
      list[index][1].update(result);
    });
  }
}
