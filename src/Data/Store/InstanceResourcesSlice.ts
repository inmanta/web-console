import { Action, action } from "easy-peasy";
import { RemoteData, InstanceResourceModel } from "@/Core";

/**
 * The resourcesSlice stores resources.
 * For a single ServiceInstance we store its list of resources.
 * So 'byId' means by ServiceInstance id.
 */
export interface InstanceResourcesSlice {
  byId: Record<string, RemoteData.Type<string, InstanceResourceModel[]>>;
  setData: Action<
    InstanceResourcesSlice,
    { id: string; value: RemoteData.Type<string, InstanceResourceModel[]> }
  >;
}

export const instanceResourcesSlice: InstanceResourcesSlice = {
  byId: {},
  setData: action((state, payload) => {
    state.byId[payload.id] = payload.value;
  }),
};
