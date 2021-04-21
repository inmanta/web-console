import { Scheduler, Task } from "./Ports";

export class SchedulerImpl implements Scheduler {
  private readonly tasks: Record<string, Task> = {};
  private readonly effectResults: Record<string, unknown> = {};
  private ongoing = false;

  constructor(private readonly delay: number) {}

  private isTaskRegistered(id: string): boolean {
    return typeof this.tasks[id] !== "undefined";
  }

  private isTasksEmpty(): boolean {
    return Object.keys(this.tasks).length <= 0;
  }

  register(id: string, task: Task): void {
    if (this.isTaskRegistered(id)) {
      throw new Error(`Task with id ${id} is already registered`);
    }
    this.tasks[id] = task;
    this.revalidateTicker();
  }

  private async execute(): Promise<void> {
    if (this.isTasksEmpty()) return;
    const list = Object.entries(this.tasks);

    const promises = list.map(([, task]) => task.effect());
    const results = await Promise.all(promises);

    const resultList: [string, unknown][] = results.map((result, index) => [
      list[index][0],
      result,
    ]);
    const resultDict = resultList.reduce<Record<string, unknown>>(
      (acc, [id, result]) => {
        acc[id] = result;
        return acc;
      },
      {}
    );

    list.forEach(([id, task]) => {
      task.update(resultDict[id]);
    });

    window.setTimeout(() => {
      this.execute();
    }, this.delay);
  }

  private revalidateTicker(): void {
    if (this.isTasksEmpty()) return;
    if (this.ongoing) return;

    window.setTimeout(() => {
      this.execute();
    }, this.delay);
    this.ongoing = true;
  }

  unregister(id: string): void {
    delete this.tasks[id];
    this.revalidateTicker();
  }
}
