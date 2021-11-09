import { FlatEnvironment } from "@/Core/Domain";

export interface EnvironmentHandler {
  set(environmentId: string): void;
  useSelected(): FlatEnvironment | undefined;
}
