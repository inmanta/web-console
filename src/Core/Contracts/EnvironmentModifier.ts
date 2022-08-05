export interface EnvironmentModifier {
  useIsHalted(): boolean;
  useIsServerCompileEnabled(): boolean;
  useIsProtectedEnvironment(): boolean;
  setEnvironment(environment: string): void;
}
