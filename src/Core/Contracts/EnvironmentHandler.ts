import { Location } from "history";
import { FlatEnvironment } from "@/Core/Domain";
import { Navigate, RemoteData } from "@/Core/Language";

export interface EnvironmentHandler {
  set(navigate: Navigate, location: Location, environmentId: string): void;
  useSelected(): FlatEnvironment | undefined;
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
    allEnvironments: RemoteData.Type<string, FlatEnvironment[]>,
    search: string
  ): FlatEnvironment | undefined;
}
