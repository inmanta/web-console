import { EnvironmentHandler, FlatEnvironment } from "@/Core";
import { EnvironmentPreview } from "@/Data/Queries";

/**
 * MockEnvironmentHandler is a function that returns a mocked EnvironmentHandler object.
 *
 * @param {FlatEnvironment} environment - The environment to be used in the mock.
 * @param {boolean} isCompiling - Whether the mocked environment reports as compiling.
 * @param {EnvironmentPreview[]} allEnvironments - The list returned by `useAll()`, for tests that
 *   exercise logic depending on the full environment list (defaults to empty).
 * @returns {EnvironmentHandler}An EnvironmentHandler object.
 */
export function MockEnvironmentHandler(
  environment: FlatEnvironment,
  isCompiling: boolean = false,
  allEnvironments: EnvironmentPreview[] = []
): EnvironmentHandler {
  function useName(): string {
    return environment.name;
  }

  function useId(): string {
    return environment.id;
  }

  function set(): void {
    throw new Error("Method not implemented.");
  }

  function useSelected(): EnvironmentPreview {
    return {
      id: environment.id,
      name: environment.name,
      halted: environment.halted,
      isCompiling: false,
      isExpertMode: Boolean(environment.settings.enable_lsm_expert_mode),
    };
  }

  function determineSelected(): EnvironmentPreview | undefined {
    throw new Error("Method not implemented.");
  }

  function useIsCompiling(): boolean {
    return isCompiling;
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

  function useAll(): EnvironmentPreview[] {
    return allEnvironments;
  }

  return {
    useId,
    set,
    useName,
    useSelected,
    useAll,
    determineSelected,
    useIsHalted,
    useIsCompiling,
    useIsProtectedEnvironment,
    useIsServerCompileEnabled,
    useIsExpertModeEnabled,
    setAllEnvironments,
  };
}
