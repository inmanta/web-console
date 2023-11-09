import { CommandManager } from "./CommandManager";
import { QueryManager } from "./QueryManager";

interface CommandManagerResolver {
  get(): CommandManager[];
}
interface QueryManagerResolver {
  get(): QueryManager[];
  pauseContinuous(): void;
  resumeContinuous(): void;
}

export { QueryManagerResolver, CommandManagerResolver };
