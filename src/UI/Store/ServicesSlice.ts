import { Computed, Action, Thunk, computed, action, thunk } from "easy-peasy";
import { ServiceModel } from "@/Core";
import * as _ from "lodash";

export interface ServicesSlice {
  allIds: string[];
  addServices: Action<ServicesSlice, ServiceModel[]>;
  addSingleService: Action<ServicesSlice, ServiceModel>;
  updateServices: Thunk<ServicesSlice, ServiceModel[]>;
  byId: Record<string, ServiceModel>;
  getAllServices: Computed<ServicesSlice, ServiceModel[]>;
  getServicesOfEnvironment: Computed<
    ServicesSlice,
    (environmentId: string) => ServiceModel[]
  >;
  removeSingleService: Action<ServicesSlice, string>;
}

export const servicesSlice: ServicesSlice = {
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
