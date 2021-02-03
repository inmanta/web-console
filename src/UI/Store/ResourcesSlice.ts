import { Action, action, Computed, computed, Thunk, thunk } from "easy-peasy";
import { Either, RemoteData, ResourceModel } from "@/Core";
import { Injections } from "./Setup";

export interface ResourcesSlice {
  addResources: Action<
    ResourcesSlice,
    { instanceId: string; resources: ResourceModel[] }
  >;
  allIds: string[];
  byId: Record<string, ResourceModel>;
  resourcesOfInstance: Computed<
    ResourcesSlice,
    (instanceId: string) => ResourceModel[]
  >;
  fetchResources: Thunk<
    ResourcesSlice,
    { id: string; serviceEntity: string; version: string; environment: string },
    Injections,
    Record<string, unknown>,
    Promise<RemoteData.Type<string, unknown>>
  >;
}

export const resourcesSlice: ResourcesSlice = {
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
  fetchResources: thunk(async (actions, payload, helpers) => {
    const { id, serviceEntity, version, environment } = payload;
    const { resourceFetcher } = helpers.injections;

    const result = await resourceFetcher.getResources(
      id,
      serviceEntity,
      version,
      environment
    );
    if (Either.isRight(result)) {
      actions.addResources({
        instanceId: id,
        resources: result.value as ResourceModel[],
      });
    }
    return RemoteData.fromEither(result);
  }),
};
