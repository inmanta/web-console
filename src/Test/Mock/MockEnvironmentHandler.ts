import { EnvironmentHandler, FlatEnvironment } from "@/Core";

/**
 * MockEnvironmentHandler is a function that returns a mocked EnvironmentHandler object.
 *
 * @param {FlatEnvironment} environment - The environment to be used in the mock.
 * @returns {EnvironmentHandler}An EnvironmentHandler object.
 */
export function MockEnvironmentHandler(environment: FlatEnvironment): EnvironmentHandler {
  function useName(): string {
    return environment.name;
  }

  function useId(): string {
    return environment.id;
  }

  function set(): void {
    throw new Error("Method not implemented.");
  }

  function useSelected(): FlatEnvironment {
    return environment;
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
    useName,
    setAllEnvironments,
    useSelected,
    determineSelected,
  };
}
