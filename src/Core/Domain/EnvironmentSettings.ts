export interface EnvironmentSettings {
  settings: ValuesMap;
  definition: DefinitionMap;
}

export type ValuesMap = Record<string, boolean | string | number | Dict>;

export type Dict = Record<string, boolean | string | number>;

export type Value = ValuesMap[keyof ValuesMap];

export type DefinitionMap = Record<string, Definition>;

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

interface WithValue<ValueType> {
  value: ValueType;
  set: (value: ValueType) => void;
}

type BooleanInputInfo = WithValue<boolean> & BooleanDefinition;
type IntInputInfo = WithValue<number> & IntDefinition;
type EnumInputInfo = WithValue<string> & EnumDefinition;
type DictInputInfo = WithValue<Dict> & DictDefinition;

export type InputInfo =
  | BooleanInputInfo
  | IntInputInfo
  | EnumInputInfo
  | DictInputInfo;
