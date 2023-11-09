export interface Task<Data = unknown> {
  effect(): Promise<Data>;
  update(data: Data): void;
}

export interface Scheduler {
  register(id: string, task: Task): void;
  unregister(id: string): void;
  pauseTasks(): void;
  resumeTasks(): void;
}
