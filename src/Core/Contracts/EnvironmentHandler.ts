import { Location } from "react-router";
import { FlatEnvironment } from "@/Core/Domain";
import { Navigate } from "@/Core/Language";

/**
 * EnvironmentHandler is a contract for managing the environment selection and navigation.
 * It provides functions to set the current environment, get the selected environment, and determine the selected environment from the URL.
 */
export interface EnvironmentHandler {
  set(navigate: Navigate, location: Location, environmentId: string): void;
  useSelected(): FlatEnvironment | undefined;
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
  setAllEnvironments(environments: FlatEnvironment[]): void;
}
