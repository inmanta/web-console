import { Action, action } from "easy-peasy";
import { RemoteData } from "@/Core";
import { InstanceWithReferences } from "../Managers/GetInstanceWithRelations/interface";

/**
 * The serviceInstanceSlice stores service instances by their id with their respective relation-tree.
 */
export interface ServiceInstanceWithRelationsSlice {
  byId: Record<string, RemoteData.Type<string, InstanceWithReferences>>;
  setData: Action<
    ServiceInstanceWithRelationsSlice,
    { id: string; value: RemoteData.Type<string, InstanceWithReferences> }
  >;
}

export const serviceInstanceWithRelationsSlice: ServiceInstanceWithRelationsSlice =
  {
    byId: {},
    setData: action((state, payload) => {
      state.byId[payload.id] = payload.value;
    }),
  };
