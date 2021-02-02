import { Computed, computed, Action, action, Thunk, thunk } from "easy-peasy";
import {
  ServiceInstanceModel,
  ServiceInstanceModelWithTargetStates,
} from "@/Core";
import { AppSlice } from "./AppSlice";
import * as _ from "lodash";

export interface ServiceInstancesSlice {
  addInstances: Action<ServiceInstancesSlice, ServiceInstanceModel[]>;
  allIds: string[];
  byId: Record<string, ServiceInstanceModel>;
  instancesOfService: Computed<
    ServiceInstancesSlice,
    (name: string) => ServiceInstanceModel[]
  >;
  instancesWithTargetStates: Computed<
    ServiceInstancesSlice,
    (name: string) => ServiceInstanceModelWithTargetStates[],
    AppSlice
  >;
  updateInstances: Thunk<
    ServiceInstancesSlice,
    { serviceName: string; instances: ServiceInstanceModel[] }
  >;
}

export const serviceInstancesSlice: ServiceInstancesSlice = {
  addInstances: action((state, payload) => {
    state.allIds = [];
    state.byId = {};
    payload.map((instance) => {
      state.byId[instance.id] = instance as ServiceInstanceModel;
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
        const service = ((storeState as unknown) as AppSlice).services.byId[
          name
        ];
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
