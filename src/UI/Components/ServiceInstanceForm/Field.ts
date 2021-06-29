import { TextInputTypes } from "@patternfly/react-core";

export type Field = FlatField | NestedField;

export interface FlatField {
  kind: "Flat";
  name: string;
  description?: string;
  defaultValue: unknown;
  inputType: TextInputTypes | "bool";
  isOptional: boolean;
  type: string;
}

export const isFlatField = (field: Field): field is FlatField =>
  field.kind === "Flat";

export interface NestedField {
  kind: "Nested" | "DictList";
  name: string;
  description: string;
  isOptional: boolean;
  fields: Field[];
}
