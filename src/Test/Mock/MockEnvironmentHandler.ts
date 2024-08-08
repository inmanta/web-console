import { EnvironmentHandler, FlatEnvironment } from "@/Core";

export function MockEnvironmentHandler(
  environment: string,
): EnvironmentHandler {
  function useId(): string {
    return environment;
  }
  function set(): void {
    throw new Error("Method not implemented.");
  }
  function useSelected(): FlatEnvironment {
    throw new Error("Method not implemented.");
  }
  function determineSelected(): FlatEnvironment | undefined {
    throw new Error("Method not implemented.");
  }
  return {
    useId,
    set,
    useSelected,
    determineSelected,
  };
}
