import { Action, action } from "easy-peasy";
import { RemoteData, ServiceInstanceModel } from "@/Core";

/**
 * The serviceInstanceSlice stores service instances by their id.
 */
export interface ServiceInstanceSlice {
  byId: Record<string, RemoteData.Type<string, ServiceInstanceModel>>;
  setData: Action<
    ServiceInstanceSlice,
    { id: string; value: RemoteData.Type<string, ServiceInstanceModel> }
  >;
}

export const serviceInstanceSlice: ServiceInstanceSlice = {
  byId: {},
  setData: action((state, payload) => {
    state.byId[payload.id] = payload.value;
  }),
};
