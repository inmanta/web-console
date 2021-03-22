import { Action, action } from "easy-peasy";
import { InstanceConfig, RemoteData } from "@/Core";

/**
 * The InstanceConfigSlice stores the config for service instances.
 * For a single ServiceInstance we store its config.
 * So 'byId' means by ServiceInstance id.
 */
export interface InstanceConfigSlice {
  byId: Record<string, RemoteData.Type<string, InstanceConfig>>;
  setData: Action<
    InstanceConfigSlice,
    { id: string; value: RemoteData.Type<string, InstanceConfig> }
  >;
}

export const instanceConfigSlice: InstanceConfigSlice = {
  byId: {},
  setData: action((state, payload) => {
    state.byId[payload.id] = payload.value;
  }),
};
