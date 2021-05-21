import { QueryManager, CommandManager, ManagerResolver } from "@/Core";

export class DynamicDataManagerResolver
  implements ManagerResolver<QueryManager>
{
  constructor(private readonly managers: QueryManager[]) {}

  get(): QueryManager[] {
    return this.managers;
  }

  resolve(): void {
    throw new Error("Method not implemented.");
  }
}

export class DynamicCommandManagerResolver
  implements ManagerResolver<CommandManager>
{
  constructor(private readonly managers: CommandManager[]) {}

  get(): CommandManager[] {
    return this.managers;
  }

  resolve(): void {
    throw new Error("Method not implemented.");
  }
}
