import { Action, action, computed, Computed } from "easy-peasy";
import {
  RemoteData,
  ServiceInstanceModel,
  ServiceInstanceModelWithTargetStates,
} from "@/Core";
import { StoreModel } from "./Store";

export interface ServiceInstancesSlice {
  byId: Record<string, RemoteData.Type<string, ServiceInstanceModel[]>>;
  setData: Action<
    ServiceInstancesSlice,
    { id: string; value: RemoteData.Type<string, ServiceInstanceModel[]> }
  >;
  instancesWithTargetStates: Computed<
    ServiceInstancesSlice,
    (
      name: string
    ) => RemoteData.Type<string, ServiceInstanceModelWithTargetStates[]>,
    StoreModel
  >;
}

export const serviceInstancesSlice: ServiceInstancesSlice = {
  byId: {},
  setData: action((state, payload) => {
    state.byId[payload.id] = payload.value;
  }),
  instancesWithTargetStates: computed(
    [(state) => state.byId, (state, storeState) => storeState],
    (byId, storeState) => (name) => {
      const data = byId[name];
      if (typeof data === "undefined") return RemoteData.loading();

      return RemoteData.mapSuccess<
        string,
        ServiceInstanceModel[],
        ServiceInstanceModelWithTargetStates[]
      >((instances) => {
        return instances.map((instance) => {
          const instanceState = instance.state;
          const service = storeState.services.byId[name];
          if (!service) {
            return { ...instance, instanceSetStateTargets: [] };
          }
          const setStateTransfers = service.lifecycle.transfers.filter(
            (transfer) =>
              transfer.source === instanceState && transfer.api_set_state
          );
          const setStateTargets = setStateTransfers.map(
            (transfer) => transfer.target
          );
          return { ...instance, instanceSetStateTargets: setStateTargets };
        });
      })(data);
    }
  ),
};
