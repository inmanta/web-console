import { Location } from "history";
import { FlatEnvironment } from "@/Core/Domain";

export interface EnvironmentHandler {
  set(location: Location, environmentId: string): void;
  useSelected(): FlatEnvironment | undefined;
}
