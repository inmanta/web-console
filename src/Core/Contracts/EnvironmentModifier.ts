export interface EnvironmentModifier {
  useIsHalted(): boolean;
  setEnvironment(environment: string): void;
}
