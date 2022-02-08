import { TextInputTypes } from "@patternfly/react-core";
import { ParsedNumber } from "@/Core/Language";

/**
 * A field contains all the information required to setup a form field for an AttributeModel.
 * The actual live form value is not contained within this type.
 * It is kept separate in a formState object.
 */
export type Field =
  | BooleanField
  | TextField
  | EnumField
  | NestedField
  | DictListField;

interface BaseField {
  name: string;
  description?: string;
  isOptional: boolean;
}

export interface BooleanField extends BaseField {
  kind: "Boolean";
  defaultValue: unknown;
  type: string;
}

export interface TextField extends BaseField {
  kind: "Text";
  defaultValue: unknown;
  inputType: TextInputTypes;
  type: string;
}

export interface EnumField extends BaseField {
  kind: "Enum";
  defaultValue: unknown;
  type: string;
  options: Record<string, string | ParsedNumber>;
}

export interface NestedField extends BaseField {
  kind: "Nested";
  fields: Field[];
}

export interface DictListField extends BaseField {
  kind: "DictList";
  fields: Field[];
  min: ParsedNumber;
  max?: ParsedNumber;
}
