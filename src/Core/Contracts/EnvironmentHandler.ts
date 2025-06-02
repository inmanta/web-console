import { Location } from "react-router";
import { FlatEnvironment } from "@/Core/Domain";
import { Navigate } from "@/Core/Language";

/**
 * EnvironmentHandler is a contract for managing the environment selection and navigation.
 * It provides functions to set the current environment, get the selected environment, and determine the selected environment from the URL.
 *
 * - set: a function that sets the current environment
 * - useSelected: a hook that returns the selected environment
 * - useName: a hook that returns the name of the selected environment
 * - useId: a hook that returns the id of the selected environment
 * - determineSelected: a function that determines the selected environment from the URL
 * - useIsHalted: a hook that returns a boolean value indicating if the environment is halted
 * - useIsServerCompileEnabled: a hook that returns a boolean value indicating if the server compile is enabled
 * - useIsProtectedEnvironment: a hook that returns a boolean value indicating if the environment is protected
 * - useIsExpertModeEnabled: a hook that returns a boolean value indicating if the expert mode is enabled
 */
export interface EnvironmentHandler {
  set(navigate: Navigate, location: Location, environmentId: string): void;
  setAllEnvironments(environments: FlatEnvironment[]): void;
  useSelected(): FlatEnvironment | undefined;
  useName(): string;
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
