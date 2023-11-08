import {
  QueryManager,
  CommandManager,
  ICommandManagerResolver,
  IQueryManagerResolver,
  Scheduler,
} from "@/Core";
import { StaticScheduler } from "./StaticScheduler";

export class DynamicQueryManagerResolver implements IQueryManagerResolver {
  private scheduler: Scheduler = new StaticScheduler();
  constructor(
    private readonly managers: QueryManager[],
    private externalScheduler?: Scheduler,
  ) {
    if (externalScheduler !== undefined) {
      this.scheduler = this.externalScheduler as Scheduler;
    }
  }

  get(): QueryManager[] {
    return this.managers;
  }
  resumeContinuous(): void {
    this.scheduler.pauseTasks();
  }

  pauseContinuous(): void {
    this.scheduler.resumeTasks();
  }
  resolve(): void {
    throw new Error("Method not implemented.");
  }
}

export class DynamicCommandManagerResolver implements ICommandManagerResolver {
  constructor(private readonly managers: CommandManager[]) {}

  get(): CommandManager[] {
    return this.managers;
  }

  resolve(): void {
    throw new Error("Method not implemented.");
  }
}
