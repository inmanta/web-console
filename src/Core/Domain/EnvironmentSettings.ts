import { Maybe, ParsedNumber } from "@/Core/Language";

export interface EnvironmentSettings {
  settings: ValuesMap;
  definition: DefinitionMap;
}

export type ValuesMap = Record<string, boolean | string | ParsedNumber | Dict>;

export type Dict = Record<string, boolean | string | ParsedNumber>;

export type Value = ValuesMap[keyof ValuesMap];

export type DefinitionMap = Record<string, Definition>;

export type Definition =
  | BooleanDefinition
  | EnumDefinition
  | IntDefinition
  | DictDefinition
  | StrDefinition;

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
}

interface EnumDefinition extends BaseDefinition {
  type: "enum";
  default: string;
  allowed_values: string[];
}

interface IntDefinition extends BaseDefinition {
  type: "int";
  default: ParsedNumber;
}

interface DictDefinition extends BaseDefinition {
  type: "dict";
  default: Dict;
}

interface StrDefinition extends BaseDefinition {
  type: "str";
  default: string;
}

interface WithHandlers<ValueType extends Value> {
  initial: ValueType;
  value: ValueType;
  set: (value: ValueType) => void;
  update: (value: ValueType) => Promise<Maybe.Maybe<string>>;
  reset: () => Promise<Maybe.Maybe<string>>;
  isUpdateable: IsUpdateable;
}

export type BooleanInputInfo = WithHandlers<boolean> & BooleanDefinition;
export type IntInputInfo = WithHandlers<ParsedNumber> & IntDefinition;
export type EnumInputInfo = WithHandlers<string> & EnumDefinition;
export type StrInputInfo = WithHandlers<string> & StrDefinition;
export type DictInputInfo = WithHandlers<Dict> & DictDefinition;

export type InputInfo =
  | BooleanInputInfo
  | IntInputInfo
  | EnumInputInfo
  | DictInputInfo
  | StrInputInfo;


export type IsUpdateable = (
  info: Pick<InputInfo, "initial" | "value" | "default">
) => boolean;
