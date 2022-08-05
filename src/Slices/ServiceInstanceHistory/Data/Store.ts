import { Action, action } from "easy-peasy";
import { RemoteData } from "@/Core";
import { InstanceLog } from "@S/ServiceInstanceHistory/Core/Domain";

/**
 * The instanceLogsSlice stores logs related to service instances.
 * For a single ServiceInstance we store its list of logs.
 * So 'byId' means by ServiceInstance id.
 */
export interface InstanceLogsSlice {
  byId: Record<string, RemoteData.Type<string, InstanceLog[]>>;
  setData: Action<
    InstanceLogsSlice,
    { id: string; value: RemoteData.Type<string, InstanceLog[]> }
  >;
}

export const instanceLogsSlice: InstanceLogsSlice = {
  byId: {},
  setData: action((state, payload) => {
    state.byId[payload.id] = payload.value;
  }),
};
