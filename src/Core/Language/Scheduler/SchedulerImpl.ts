import { forIn, mapValues, omit } from "lodash-es";
import { Dictionary, DictionaryImpl } from "@/Core/Language/Dictionary";
import { resolvePromiseRecord } from "@/Core/Language/Utils";
import { Scheduler, Task } from "./Scheduler";

export class SchedulerImpl implements Scheduler {
  tasks: Dictionary<Task>;
  private pausedTasks: Dictionary<Task> = new DictionaryImpl<Task>();
  private nextEffects: Record<string, ReturnType<Task["effect"]>> = {};
  private nextUpdates: Record<string, Task["update"]> = {};
  private ongoing = false;

  constructor(
    private readonly delay: number,
    private readonly taskWrapper?: (task: Task) => Task,
    tasks?: Dictionary<Task>,
  ) {
    this.tasks =
      typeof tasks !== "undefined" ? tasks : new DictionaryImpl<Task>();
  }

  pauseTasks(): void {
    const tasksToPause = this.tasks.toObject();
    Object.keys(tasksToPause).forEach((key) => {
      this.tasks.drop(key);
      this.pausedTasks.set(key, this.wrapTask(tasksToPause[key]));
    });
    this.nextEffects = {};
    this.nextUpdates = {};
    this.revalidateTicker();
  }

  resumeTasks(): void {
    const tasksToResume = this.pausedTasks.toObject();
    Object.keys(tasksToResume).forEach((key) => {
      this.pausedTasks.drop(key);
      this.tasks.set(key, this.wrapTask(tasksToResume[key]));
    });
    this.revalidateTicker();
  }

  unregister(id: string): void {
    this.tasks.drop(id);
    this.nextEffects = omit(this.nextEffects, [id]);
    this.nextUpdates = omit(this.nextUpdates, [id]);
    this.revalidateTicker();
  }

  register(id: string, task: Task): void {
    const setCompleted = this.tasks.set(id, this.wrapTask(task));
    if (!setCompleted) {
      throw new Error(`A task with id ${id} is already registered`);
    }
    this.revalidateTicker();
  }

  private wrapTask(task: Task): Task {
    if (!this.taskWrapper) return task;
    return this.taskWrapper(task);
  }

  private async execute(): Promise<void> {
    if (this.tasks.isEmpty()) {
      this.ongoing = false;
      return;
    }
    const taskRecord = this.tasks.toObject();
    this.nextEffects = mapValues(taskRecord, (task) => task.effect());
    this.nextUpdates = mapValues(taskRecord, (task) => task.update);

    forIn(await resolvePromiseRecord(this.nextEffects), (data, key) => {
      const update = this.nextUpdates[key];
      if (typeof update === "undefined") return;
      update(data);
    });

    this.nextEffects = {};
    this.nextUpdates = {};

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
}
