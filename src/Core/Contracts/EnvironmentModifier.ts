import { FlatEnvironment } from "../Domain";

/**
 * EnvironmentModifier is a function that returns an object with the following properties:
 *
 * - useIsHalted: a hook that returns a boolean value indicating if the environment is halted
 * - useIsServerCompileEnabled: a hook that returns a boolean value indicating if the server compile is enabled
 * - useIsProtectedEnvironment: a hook that returns a boolean value indicating if the environment is protected
 * - useIsExpertModeEnabled: a hook that returns a boolean value indicating if the expert mode is enabled
 * - setEnvironment: a function that sets the environment
 * - setEnvironmentSettings: a function that sets the environment settings
 */
export interface EnvironmentModifier {
  useIsHalted(): boolean;
  useIsServerCompileEnabled(): boolean;
  useIsProtectedEnvironment(): boolean;
  setEnvironment(environment: FlatEnvironment): void;
  useIsExpertModeEnabled(): boolean;
}
