import { Action, action } from "easy-peasy";
import { RemoteData, ServiceModel } from "@/Core";

/**
 * The ServicesSlice stores Services.
 */
export interface ServicesSlice2 {
  byId: Record<string, RemoteData.Type<string, ServiceModel>>;
  setData: Action<
    ServicesSlice2,
    { id: string; value: RemoteData.Type<string, ServiceModel> }
  >;
}

export const servicesSlice2: ServicesSlice2 = {
  byId: {},
  setData: action((state, payload) => {
    state.byId[payload.id] = payload.value;
  }),
};
