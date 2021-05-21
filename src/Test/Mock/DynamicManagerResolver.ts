import { DataManager, CommandManager, ManagerResolver } from "@/Core";

export class DynamicDataManagerResolver
  implements ManagerResolver<DataManager> {
  constructor(private readonly managers: DataManager[]) {}

  get(): DataManager[] {
    return this.managers;
  }

  resolve(): void {
    throw new Error("Method not implemented.");
  }
}

export class DynamicCommandManagerResolver
  implements ManagerResolver<CommandManager> {
  constructor(private readonly managers: CommandManager[]) {}

  get(): CommandManager[] {
    return this.managers;
  }

  resolve(): void {
    throw new Error("Method not implemented.");
  }
}
