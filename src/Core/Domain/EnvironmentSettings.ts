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
  | PositiveFloatDefinition
  | DictDefinition
  | StrDefinition
  | UnknownDefinition;

interface BaseDefinition {
  name: string;
  doc: string;
  recompile: boolean;
  update_model: boolean;
  agent_restart: boolean;
}

export interface UnknownDefinition extends BaseDefinition {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: any;
}

export interface BooleanDefinition extends BaseDefinition {
  type: "bool";
  default: boolean;
}

export interface EnumDefinition extends BaseDefinition {
  type: "enum";
  default: string;
  allowed_values: string[];
}

export interface IntDefinition extends BaseDefinition {
  type: "int";
  default: ParsedNumber;
}

export interface PositiveFloatDefinition extends BaseDefinition {
  type: "positive_float";
  default: ParsedNumber;
}

export interface DictDefinition extends BaseDefinition {
  type: "dict";
  default: Dict;
}

export interface StrDefinition extends BaseDefinition {
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
export type PositiveFloatInputInfo = WithHandlers<ParsedNumber> &
  PositiveFloatDefinition;

export type InputInfo =
  | BooleanInputInfo
  | IntInputInfo
  | EnumInputInfo
  | DictInputInfo
  | StrInputInfo
  | PositiveFloatInputInfo;

export type IsUpdateable = (
  info: Pick<InputInfo, "initial" | "value" | "default">,
) => boolean;
