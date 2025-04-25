import { EnvironmentHandler, FlatEnvironment } from "@/Core";

export function MockEnvironmentHandler(environment: FlatEnvironment): EnvironmentHandler {
  function useId(): string {
    return environment.id;
  }

  function set(): void {
    throw new Error("Method not implemented.");
  }

  function useSelected(): FlatEnvironment {
    throw new Error("Method not implemented.");
  }

  function setAllEnvironments(_environments: FlatEnvironment[]): void {
    return;
  }

  function determineSelected(): FlatEnvironment | undefined {
    throw new Error("Method not implemented.");
  }

  return {
    useId,
    set,
    setAllEnvironments,
    useSelected,
    determineSelected,
  };
}
