import { Action, action } from "easy-peasy";
import { RemoteData } from "@/Core";
import { InstanceWithRelations } from "../Managers/V2/GetInstanceWithRelations";

/**
 * The serviceInstanceSlice stores service instances by their id with their respective relation-tree.
 */
export interface ServiceInstanceWithRelationsSlice {
  byId: Record<string, RemoteData.Type<string, InstanceWithRelations>>;
  setData: Action<
    ServiceInstanceWithRelationsSlice,
    { id: string; value: RemoteData.Type<string, InstanceWithRelations> }
  >;
}

export const serviceInstanceWithRelationsSlice: ServiceInstanceWithRelationsSlice =
  {
    byId: {},
    setData: action((state, payload) => {
      state.byId[payload.id] = payload.value;
    }),
  };
