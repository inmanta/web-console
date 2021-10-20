export interface EnvironmentSettings {
  settings: EnvironmentSettingsValues;
  definition: EnvironmentSettingsDefinition;
}

export type EnvironmentSettingsValues = Record<
  string,
  boolean | string | number | Record<string, boolean | string | number>
>;

export type EnvironmentSettingsDefinition = Record<string, Definition>;

export type Definition =
  | BooleanDefinition
  | EnumDefinition
  | IntDefinition
  | DictDefinition;

interface BaseDefinition {
  name: string;
  doc: string;
  recompile: boolean;
  update_model: boolean;
  agent_restart: boolean;
}

interface BooleanDefinition extends BaseDefinition {
  type: "bool";
  default: boolean;
  allowed_values: null;
}

interface EnumDefinition extends BaseDefinition {
  type: "enum";
  default: string;
  allowed_values: string[];
}

interface IntDefinition extends BaseDefinition {
  type: "int";
  default: number;
  allowed_values: null;
}

interface DictDefinition extends BaseDefinition {
  type: "dict";
  default: unknown;
  allowed_values: null;
}
