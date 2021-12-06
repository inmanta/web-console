import { TextInputTypes } from "@patternfly/react-core";

/**
 * A field contains all the information required to setup a form field for an AttributeModel.
 * The actual live form value is not contained within this type.
 * It is kept separate in a formState object.
 */
export type Field = FlatField | NestedField | DictListField;

interface BaseField {
  name: string;
  description?: string;
  isOptional: boolean;
}

export interface FlatField extends BaseField {
  kind: "Flat";
  defaultValue: unknown;
  inputType: TextInputTypes | "bool";
  type: string;
}

export interface NestedField extends BaseField {
  kind: "Nested";
  fields: Field[];
}

export interface DictListField extends BaseField {
  kind: "DictList";
  fields: Field[];
  min: number;
  max?: number;
}
