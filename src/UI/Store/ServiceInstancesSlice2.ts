import { Action, action } from "easy-peasy";
import { RemoteData, ServiceInstanceModel } from "@/Core";

export interface ServiceInstancesSlice2 {
  byId: Record<string, RemoteData.Type<string, ServiceInstanceModel[]>>;
  setData: Action<
    ServiceInstancesSlice2,
    { id: string; value: RemoteData.Type<string, ServiceInstanceModel[]> }
  >;
}

export const serviceInstancesSlice2: ServiceInstancesSlice2 = {
  byId: {},
  setData: action((state, payload) => {
    state.byId[payload.id] = payload.value;
  }),
};
