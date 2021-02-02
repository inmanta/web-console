import { Action, action, Computed, computed } from "easy-peasy";
import { ResourceModel } from "@/Core";

export interface ResourceState {
  addResources: Action<
    ResourceState,
    { instanceId: string; resources: ResourceModel[] }
  >;
  allIds: string[];
  byId: Record<string, ResourceModel>;
  resourcesOfInstance: Computed<
    ResourceState,
    (instanceId: string) => ResourceModel[]
  >;
}

export const resourceState: ResourceState = {
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
