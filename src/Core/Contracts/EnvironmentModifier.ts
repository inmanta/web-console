export interface EnvironmentModifier {
  isHalted(): boolean;
  setEnvironment(environment: string): void;
}
