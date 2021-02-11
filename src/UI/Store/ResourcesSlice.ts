import { Action, action } from "easy-peasy";
import { RemoteData, ResourceModel } from "@/Core";

export interface ResourcesSlice {
  byId: Record<string, RemoteData.Type<string, ResourceModel[]>>;
  setData: Action<
    ResourcesSlice,
    { id: string; value: RemoteData.Type<string, ResourceModel[]> }
  >;
}

export const resourcesSlice: ResourcesSlice = {
  byId: {},
  setData: action((state, payload) => {
    state.byId[payload.id] = payload.value;
  }),
};
