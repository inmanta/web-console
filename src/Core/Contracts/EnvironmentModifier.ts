export interface EnvironmentModifier {
  useIsHalted(): boolean;
  useIsServerCompileEnabled(): boolean;
  setEnvironment(environment: string): void;
}
