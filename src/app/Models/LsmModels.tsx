export interface IAttributeModel {
  name: string;
  type: string;
  description: string;
  modifier: string;
}

export interface IStateModel {
  deleted: boolean;
  label: string;
  model_state: string;
  name: string;
  purge_resources: boolean;
}

export interface ITransferModel {
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

export interface ILifecycleModel {
  initialState: string;
  states: IStateModel[];
  transfers: ITransferModel[];
}

export interface IServiceModel {
  name: string;
  environment: string;
  lifecycle: ILifecycleModel;
  attributes: IAttributeModel[];
}
