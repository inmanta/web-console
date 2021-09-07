import { Config } from "./Config";

export interface AttributeModel {
  name: string;
  type: string;
  description?: string;
  modifier: string;
  default_value: string | null;
  default_value_set: boolean;
  validation_type?: string | null;
  validation_parameters?: Record<string, unknown> | null;
}

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
  danger: number;
  warning: number;
  success: number;
  info: number;
  no_label: number;
}

export interface InstanceSummary {
  by_state: Record<string, number>;
  by_label: InstancesByLabel;
  total: number;
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
  lower_limit: number;
  upper_limit?: number;
  attributes: AttributeModel[];
  embedded_entities: EmbeddedEntity[];
}
