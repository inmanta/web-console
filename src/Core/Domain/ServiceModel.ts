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

interface StateModel {
  deleted: boolean;
  label?: "info" | "success" | "warning" | "danger";
  export_resources: boolean;
  name: string;
  purge_resources: boolean;
}

interface TransferModel {
  api_set_state: boolean;
  auto: boolean;
  config_name: string;
  description: string;
  error: string;
  error_operation: string;
  on_delete: boolean;
  on_update: boolean;
  resource_based: boolean;
  source: string;
  target: string;
  target_operation: string;
  validate: boolean;
}

export interface LifecycleModel {
  initialState: string;
  states: StateModel[];
  transfers: TransferModel[];
}

export interface ServiceIdentifier {
  name: string;
  environment: string;
}

export interface ServiceModel extends ServiceIdentifier {
  description?: string;
  lifecycle: LifecycleModel;
  attributes: AttributeModel[];
  service_identity?: string;
  service_identity_display_name?: string;
}
