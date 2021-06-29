import { FormInputAttribute } from "@/UI/Components";

export type Field = FlatField | NestedField;

interface FlatField extends FormInputAttribute {
  kind: "Flat";
}

export interface NestedField {
  kind: "Nested" | "DictList";
  name: string;
  description: string;
  isOptional: boolean;
  fields: Field[];
}
