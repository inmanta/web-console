import { FlatEnvironment } from "../Domain";
import { EnvironmentSettings } from "../Domain/EnvironmentSettings";

export interface EnvironmentModifier {
  useIsHalted(): boolean;
  useIsServerCompileEnabled(): boolean;
  useIsProtectedEnvironment(): boolean;
  setEnvironment(environment: FlatEnvironment): void;
  setEnvironmentSettings(environmentSettings: EnvironmentSettings): void;
  useIsExpertModeEnabled(): boolean;
}
