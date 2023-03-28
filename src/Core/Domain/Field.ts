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
  | TextListField
  | EnumField
  | NestedField
  | DictListField
  | RelationListField
  | InterServiceRelationField;

export type FieldLikeWithFormState = Field;

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

export interface TextListField extends BaseField {
  kind: "TextList";
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

export interface RelationListField extends BaseField {
  kind: "RelationList";
  serviceEntity: string;
  min: ParsedNumber;
  max?: ParsedNumber;
}

export interface InterServiceRelationField extends BaseField {
  kind: "InterServiceRelation";
  serviceEntity: string;
}
