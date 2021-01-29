import { IObjectWithId, IProjectStoreModel } from "./CoreModels";
import { Computed, computed, Action, action, Thunk, thunk } from "easy-peasy";
import * as _ from "lodash";

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

export interface ServiceInstanceModelWithTargetStates
  extends IServiceInstanceModel {
  instanceSetStateTargets: string[];
}

export interface IInstanceDictState {
  addInstances: Action<IInstanceDictState, IServiceInstanceModel[]>;
  allIds: string[];
  byId: Record<string, IServiceInstanceModel>;
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
