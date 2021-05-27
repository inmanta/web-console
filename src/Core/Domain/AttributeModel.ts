export interface AttributeModel {
  name: string;
  type: string;
  description: string;
  modifier: string;
  default_value?: string;
  default_value_set: boolean;
  validation_type?: string;
  validation_parameters?: Record<string, unknown>;
}
