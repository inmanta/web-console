import { Action, action, Computed, computed, Thunk, thunk } from "easy-peasy";
import {
  Either,
  InstanceForResources,
  RemoteData,
  ResourceModelWithInstance,
} from "@/Core";
import { Injections } from "./Setup";

export interface ResourcesSlice {
  addResources: Action<
    ResourcesSlice,
    { instanceId: string; resources: ResourceModelWithInstance[] }
  >;
  allIds: string[];
  byId: Record<string, ResourceModelWithInstance>;
  resourcesOfInstance: Computed<
    ResourcesSlice,
    (instanceId: string) => ResourceModelWithInstance[]
  >;
  fetchResources: Thunk<
    ResourcesSlice,
    { instance: InstanceForResources },
    Injections,
    Record<string, unknown>,
    Promise<RemoteData.Type<string, unknown>>
  >;
}

export const resourcesSlice: ResourcesSlice = {
  addResources: action((state, payload) => {
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
  fetchResources: thunk(async (actions, payload, helpers) => {
    const { instance } = payload;
    const { resourceFetcher } = helpers.injections;
    const result = await resourceFetcher.getResources(instance);
    if (Either.isRight(result)) {
      actions.addResources({
        instanceId: instance.id,
        resources: result.value as ResourceModelWithInstance[],
      });
    }
    return RemoteData.fromEither(result);
  }),
};
