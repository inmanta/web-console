import { TextInputTypes } from "@patternfly/react-core";

export type Field = FlatField | NestedField | DictListField;

export interface FlatField {
  kind: "Flat";
  name: string;
  description?: string;
  defaultValue: unknown;
  inputType: TextInputTypes | "bool";
  isOptional: boolean;
  type: string;
}

export interface NestedField {
  kind: "Nested";
  name: string;
  description?: string;
  isOptional: boolean;
  fields: Field[];
}

export interface DictListField {
  kind: "DictList";
  name: string;
  description?: string;
  isOptional: boolean;
  fields: Field[];
  min: number;
  max?: number;
}
