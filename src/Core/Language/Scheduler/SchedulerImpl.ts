import { Dictionary, DictionaryImpl } from "@/Core/Language/Dictionary";
import * as Maybe from "@/Core/Language/Maybe";
import { Scheduler, Task } from "./Scheduler";
import { resolvePromiseRecord } from "@/Core/Language/Utils";

export class SchedulerImpl implements Scheduler {
  private readonly tasks = new DictionaryImpl<Task>();
  private ongoing = false;

  constructor(
    private readonly delay: number,
    private readonly taskWrapper?: (task: Task) => Task
  ) {}

  /**
   * @TODO remove pending promise or abort pending request
   */
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
    const taskRecord = this.tasks.toObject();
    const promiseRecord = Object.entries(taskRecord).reduce((acc, curr) => {
      acc[curr[0]] = curr[1].effect();
      return acc;
    }, {});

    const resolvedTasks = await resolvePromiseRecord(promiseRecord);
    Object.entries(taskRecord).forEach(([key, task]) =>
      task.update(resolvedTasks[key])
    );

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
