import { Action, action, Computed, computed, Thunk, thunk } from "easy-peasy";
import { Either, ResourceModel } from "@/Core";

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
    unknown,
    Record<string, unknown>,
    Promise<string | null>
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
  fetchResources: thunk(
    async (actions, { id, serviceEntity, version, environment }) => {
      const fetcher = new ApiFetcher();

      const result = await fetcher.getResources(
        id,
        serviceEntity,
        version,
        environment
      );
      if (Either.isLeft(result)) return result.value;
      actions.addResources({
        instanceId: id,
        resources: result.value as ResourceModel[],
      });
      return null;
    }
  ),
};

class ApiFetcher {
  private getBaseUrl() {
    return process.env.API_BASEURL ? process.env.API_BASEURL : "";
  }

  private getResourcesUrl(entity: string, id: string, version: string) {
    return `${this.getBaseUrl()}/lsm/v1/service_inventory/${entity}/${id}/resources?current_version=${version}`;
  }

  async getResources(
    id: string,
    entity: string,
    version: string,
    environment: string
  ): Promise<Either.Type<string, unknown>> {
    const url = this.getResourcesUrl(entity, id, version);
    const headers = { "X-Inmanta-Tid": environment };

    try {
      const result = await fetch(`${url}`, { headers });
      const data = await result.json();
      return Either.right(data.data);
    } catch (e) {
      return Either.left(e);
    }
  }
}
