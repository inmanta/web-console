import { IObjectWithId } from "./CoreModels";
import { Computed, computed, Action, action } from "easy-peasy";

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

export interface IServiceDict {
  [Key: string]: IServiceModel
}

export interface IServiceDictState {
  allIds: string[],
  addServices: Action<IServiceDictState, IServiceModel[]>,
  byId: IServiceDict,
  getAllServices: Computed<IServiceDictState, IServiceModel[]>;
  getServicesOfEnvironment: Computed<IServiceDictState, (environmentId: string) => IServiceModel[]>;
}

export interface IInstanceAttributeModel {
  [Key: string]: string | string[];
}

export interface IServiceInstanceModel extends IObjectWithId {
  active_attributes: IInstanceAttributeModel;
  callback: string[];
  candidate_attributes: IInstanceAttributeModel;
  deleted: boolean;
  environment: string;
  last_updated: Date;
  rollback_attributes: null;
  service_entity: string;
  state: string;
  version: number;
}
export interface IInstanceDict {
  [Key: string]: IServiceInstanceModel
}

export interface IInstanceDictState {
  addInstances: Action<IInstanceDictState, any[]>;
  allIds: string[],
  byId: IInstanceDict,
  instancesOfService: Computed<IInstanceDictState, (name: string) => IServiceInstanceModel[]>;
}

export const serviceDictState: IServiceDictState = {
  addServices: action((state, payload) => {
    payload.map(service => {
      state.byId[service.name] = service;
      state.allIds.push(service.name);
    });
  }),
  allIds: [],
  byId: {},
  getAllServices: computed(state => {
    return Object.values(state.byId);
  }),
  getServicesOfEnvironment: computed(state => environmentId => {
    return Object.values(state.byId).filter(service => service.environment === environmentId);
  }),
}

export const instanceDictState: IInstanceDictState = {
  addInstances: action((state, payload) => {
    payload.map(instance => {
      state.byId[instance.id] = instance as IServiceInstanceModel;
      state.byId[instance.id].last_updated = new Date(instance.last_updated);
      state.allIds.push(instance.id);
    });
  }),
  allIds: [],
  byId: {},
  instancesOfService: computed((state) => name => {
    return Object.values(state.byId).filter(instance => (instance.service_entity === name));
  }),
}