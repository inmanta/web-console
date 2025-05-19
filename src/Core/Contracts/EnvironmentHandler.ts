import { Location } from "react-router";
import { FlatEnvironment } from "@/Core/Domain";
import { Navigate } from "@/Core/Language";

/**
 * EnvironmentHandler is a contract for managing the environment selection and navigation.
 * It provides functions to set the current environment, get the selected environment, and determine the selected environment from the URL.
 *
 * - set: a function that sets the current environment
 * - useIsHalted: a hook that returns a boolean value indicating if the environment is halted
 * - useIsServerCompileEnabled: a hook that returns a boolean value indicating if the server compile is enabled
 * - useIsProtectedEnvironment: a hook that returns a boolean value indicating if the environment is protected
 * - useIsExpertModeEnabled: a hook that returns a boolean value indicating if the expert mode is enabled
 */
export interface EnvironmentHandler {
  set(navigate: Navigate, location: Location, environmentId: string): void;
  useSelected(): FlatEnvironment | undefined;

  /**
   * If this function is called, it means the environment is required.
   * If it is required, the environment should be defined.
   * If it is not defined, something is wrong with the code.
   * This should never happen during runtime.
   * @returns the environment name
   * @throws error when there is no environment defined
   */
  useName(): string;

  /**
   * If this function is called, it means the environment is required.
   * If it is required, the environment should be defined.
   * If it is not defined, something is wrong with the code.
   * This should never happen during runtime.
   * @returns the environment id
   * @throws error when there is no environment defined
   */
  useId(): string;
  determineSelected(
    allEnvironments: FlatEnvironment[],
    search: string
  ): FlatEnvironment | undefined;
  useIsHalted(): boolean;
  useIsServerCompileEnabled(): boolean;
  useIsProtectedEnvironment(): boolean;
  useIsExpertModeEnabled(): boolean;
}
