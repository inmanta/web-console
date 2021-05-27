import { Config } from "./Config";
import { AttributeModel } from "./AttributeModel";

export interface StateModel {
  deleted: boolean;
  label?: "info" | "success" | "warning" | "danger";
  export_resources: boolean;
  name: string;
  purge_resources: boolean;
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
  instance_summary?: InstanceSummary;
}
