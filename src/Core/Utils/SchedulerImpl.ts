import { Maybe } from "@/Core/Language";
import { Dictionary } from "./Dictionary";
import { DictionaryImpl } from "./DictionaryImpl";
import { Scheduler, Task } from "./Scheduler";

export class SchedulerImpl implements Scheduler {
  private readonly tasks = new DictionaryImpl<Task>();
  private ongoing = false;

  constructor(
    private readonly delay: number,
    private readonly taskWrapper?: (task: Task) => Task
  ) {}

  unregister(id: string): void {
    this.tasks.drop(id);
    this.revalidateTicker();
  }

  register(id: string, task: Task): void {
    if (Maybe.isSome(this.tasks.get(id))) {
      throw new Error(`Task with id ${id} is already registered`);
    }
    this.tasks.set(id, this.wrapTask(task));
    this.revalidateTicker();
  }

  private wrapTask(task: Task): Task {
    if (!this.taskWrapper) return task;
    return this.taskWrapper(task);
  }

  private async execute(): Promise<void> {
    if (this.tasks.isEmpty()) return;
    const list = Object.entries(this.tasks.toObject());

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

    list.forEach(([id, task]) => task.update(resultDict[id]));

    window.setTimeout(() => {
      this.execute();
    }, this.delay);
  }

  private revalidateTicker(): void {
    if (this.tasks.isEmpty()) return;
    if (this.ongoing) return;

    window.setTimeout(() => {
      this.execute();
    }, this.delay);
    this.ongoing = true;
  }

  getTasks(): Dictionary<Task> {
    return this.tasks;
  }
}
