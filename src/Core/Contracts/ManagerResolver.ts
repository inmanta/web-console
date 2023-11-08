import { CommandManager } from "./CommandManager";
import { QueryManager } from "./QueryManager";

interface ICommandManagerResolver {
  get(): CommandManager[];
}
interface IQueryManagerResolver {
  get(): QueryManager[];
  pauseContinuous(): void;
  resumeContinuous(): void;
}

export { IQueryManagerResolver, ICommandManagerResolver };
