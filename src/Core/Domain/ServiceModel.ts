import { ParsedNumber } from "@/Core/Language";
import { AttributeValidation } from "./AttributeValidation";
import { Config } from "./Config";

export type AttributeModel = AttributeValidation & {
  name: string;
  type: string;
  description?: string;
  modifier: string;
  default_value: string | null;
  default_value_set: boolean;
};

export interface StateModel {
  deleted: boolean;
  label?: "info" | "success" | "warning" | "danger";
  validate_self?: "candidate" | "active" | null;
  validate_others?: "candidate" | "active" | null;
  export_resources: boolean;
  name: string;
  purge_resources: boolean;
  values?: Record<string, unknown>;
}

export interface TransferModel {
  api_set_state: boolean;
  auto: boolean;
  config_name: string | null;
  description: string;
  error: string | null;
  error_operation: string | null;
  on_delete: boolean;
  on_update: boolean;
  resource_based: boolean;
  source: string;
  target: string;
  target_operation: string | null;
  validate: boolean;
}

export interface LifecycleModel {
  initial_state: string;
  name?: string;
  states: StateModel[];
  transfers: TransferModel[];
}

export interface ServiceIdentifier {
  name: string;
}

export interface InstancesByLabel {
  danger: ParsedNumber;
  warning: ParsedNumber;
  success: ParsedNumber;
  info: ParsedNumber;
  no_label: ParsedNumber;
}

export interface InstanceSummary {
  by_state: Record<string, ParsedNumber>;
  by_label: InstancesByLabel;
  total: ParsedNumber;
}

export interface ServiceModel extends ServiceIdentifier {
  environment: string;
  description?: string;
  lifecycle: LifecycleModel;
  attributes: AttributeModel[];
  service_identity?: string;
  service_identity_display_name?: string;
  config: Config;
  instance_summary?: InstanceSummary | null;
  embedded_entities: EmbeddedEntity[];
}

export interface EmbeddedEntity {
  name: string;
  description?: string;
  modifier: string;
  lower_limit: ParsedNumber;
  upper_limit?: ParsedNumber;
  attributes: AttributeModel[];
  embedded_entities: EmbeddedEntity[];
}
