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

  function determineSelected(): FlatEnvironment | undefined {
    throw new Error("Method not implemented.");
  }

  function useIsHalted(): boolean {
    return environment.halted;
  }

  function useIsProtectedEnvironment(): boolean {
    return Boolean(environment.settings.protected_environment);
  }

  function useIsServerCompileEnabled(): boolean {
    return Boolean(environment.settings.server_compile);
  }

  function useIsExpertModeEnabled(): boolean {
    return Boolean(environment.settings.enable_lsm_expert_mode);
  }

  function setAllEnvironments(): void {
    return;
  }

  return {
    useId,
    set,
    useName,
    useSelected,
    determineSelected,
    useIsHalted,
    useIsProtectedEnvironment,
    useIsServerCompileEnabled,
    useIsExpertModeEnabled,
    setAllEnvironments,
  };
}
