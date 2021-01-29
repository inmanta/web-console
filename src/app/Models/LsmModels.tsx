import { IObjectWithId, IProjectStoreModel } from "./CoreModels";
import { Computed, computed, Action, action, Thunk, thunk } from "easy-peasy";
import * as _ from "lodash";
import { ServiceModel } from "@/Core";

export interface IServiceDict {
  [Key: string]: ServiceModel;
}

export interface IServiceDictState {
  allIds: string[];
  addServices: Action<IServiceDictState, ServiceModel[]>;
  addSingleService: Action<IServiceDictState, ServiceModel>;
  updateServices: Thunk<IServiceDictState, ServiceModel[]>;
  byId: IServiceDict;
  getAllServices: Computed<IServiceDictState, ServiceModel[]>;
  getServicesOfEnvironment: Computed<
    IServiceDictState,
    (environmentId: string) => ServiceModel[]
  >;
  removeSingleService: Action<IServiceDictState, string>;
}

export interface IInstanceAttributeModel {
  [Key: string]: string | string[] | boolean | number | null;
}

export interface IServiceInstanceModel extends IObjectWithId {
  active_attributes: IInstanceAttributeModel | null;
  callback: string[];
  candidate_attributes: IInstanceAttributeModel | null;
  deleted: boolean;
  environment: string;
  last_updated: string;
  created_at: string;
  rollback_attributes: IInstanceAttributeModel | null;
  service_entity: string;
  state: string;
  version: number;
}
export interface IInstanceDict {
  [Key: string]: IServiceInstanceModel;
}

export interface IInstanceDictState {
  addInstances: Action<IInstanceDictState, IServiceInstanceModel[]>;
  allIds: string[];
  byId: IInstanceDict;
  instancesOfService: Computed<
    IInstanceDictState,
    (name: string) => IServiceInstanceModel[]
  >;
  instancesWithTargetStates: Computed<
    IInstanceDictState,
    (name: string) => ServiceInstanceModelWithTargetStates[],
    IProjectStoreModel
  >;
  updateInstances: Thunk<
    IInstanceDictState,
    { serviceName: string; instances: IServiceInstanceModel[] }
  >;
}

export interface ServiceInstanceModelWithTargetStates
  extends IServiceInstanceModel {
  instanceSetStateTargets: string[];
}

export interface IResourceModel {
  resource_id: string;
  resource_state: string;
  instanceId: string;
}

export interface IResourceDict {
  [Key: string]: IResourceModel;
}

export interface IResourceDictState {
  addResources: Action<
    IResourceDictState,
    { instanceId: string; resources: IResourceModel[] }
  >;
  allIds: string[];
  byId: IResourceDict;
  resourcesOfInstance: Computed<
    IResourceDictState,
    (instanceId: string) => IResourceModel[]
  >;
}

export const serviceDictState: IServiceDictState = {
  addServices: action((state, payload) => {
    state.allIds = [];
    state.byId = {};
    payload.map((service) => {
      state.byId[service.name] = service;
      if (state.allIds.indexOf(service.name) === -1) {
        state.allIds.push(service.name);
      }
    });
  }),
  addSingleService: action((state, service) => {
    if (state.allIds.indexOf(service.name) === -1) {
      state.allIds.push(service.name);
      state.byId[service.name] = service;
    }
  }),
  allIds: [],
  byId: {},
  getAllServices: computed((state) => {
    return Object.values(state.byId);
  }),
  getServicesOfEnvironment: computed((state) => (environmentId) => {
    return Object.values(state.byId).filter(
      (service) => service.environment === environmentId
    );
  }),
  removeSingleService: action((state, serviceName) => {
    const indexOfId = state.allIds.indexOf(serviceName);
    if (indexOfId > -1) {
      state.allIds.splice(indexOfId, 1);
      delete state.byId[serviceName];
    }
  }),
  updateServices: thunk((actions, payload, { getState }) => {
    if (
      !_.isEqual(
        _.sortBy(getState().getAllServices, "name"),
        _.sortBy(payload, "name")
      )
    ) {
      actions.addServices(payload);
    }
  }),
};

export const instanceDictState: IInstanceDictState = {
  addInstances: action((state, payload) => {
    state.allIds = [];
    state.byId = {};
    payload.map((instance) => {
      state.byId[instance.id] = instance as IServiceInstanceModel;
      if (state.allIds.indexOf(instance.id) === -1) {
        state.allIds.push(instance.id);
      }
    });
  }),
  allIds: [],
  byId: {},
  instancesOfService: computed((state) => (name) => {
    return Object.values(state.byId).filter(
      (instance) => instance.service_entity === name
    );
  }),
  instancesWithTargetStates: computed(
    [(state) => state, (state, storeState) => storeState.projects],
    (serviceInstances, storeState) => (name) => {
      const instances = serviceInstances.instancesOfService(name);
      const instancesWithTargets = instances.map((instance) => {
        const instanceState = instance.state;
        const service = ((storeState as unknown) as IProjectStoreModel).services
          .byId[name];
        if (!service) {
          return { ...instance, instanceSetStateTargets: [] };
        }
        const setStateTransfers = service.lifecycle.transfers.filter(
          (transfer) =>
            transfer.source === instanceState && transfer.api_set_state
        );
        const setStateTargets = setStateTransfers.map(
          (transfer) => transfer.target
        );
        return { ...instance, instanceSetStateTargets: setStateTargets };
      });
      return instancesWithTargets;
    }
  ),
  updateInstances: thunk((actions, payload, { getState }) => {
    if (
      !_.isEqual(
        _.sortBy(getState().instancesOfService(payload.serviceName), "id"),
        _.sortBy(payload.instances, "id")
      )
    ) {
      actions.addInstances(payload.instances);
    }
  }),
};

export const resourceDictState: IResourceDictState = {
  addResources: action((state, payload) => {
    state.allIds = [];
    state.byId = {};
    payload.resources.map((resource) => {
      state.byId[resource.resource_id] = resource;
      state.byId[resource.resource_id].instanceId = payload.instanceId;
      if (state.allIds.indexOf(resource.resource_id) === -1) {
        state.allIds.push(resource.resource_id);
      }
    });
  }),
  allIds: [],
  byId: {},
  resourcesOfInstance: computed((state) => (instanceId) => {
    return Object.values(state.byId).filter(
      (resource) => resource.instanceId === instanceId
    );
  }),
};
