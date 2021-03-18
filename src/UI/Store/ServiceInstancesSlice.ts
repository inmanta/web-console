import { Action, action, computed, Computed } from "easy-peasy";
import {
  Query,
  RemoteData,
  ServiceIdentifier,
  ServiceInstanceModelWithTargetStates,
} from "@/Core";
import { StoreModel } from "@/UI/Store/Store";
import { injections } from "@/UI/Store/Injections";

type Data = RemoteData.Type<
  Query.Error<"ServiceInstances">,
  Query.ApiResponse<"ServiceInstances">
>;

/**
 * The ServiceInstancesSlice stores ServiceInstances.
 * ServicesInstances belong to a service, so they are stored by
 * their service name. So byId means by ServiceName.
 */
export interface ServiceInstancesSlice {
  byId: Record<string, Data>;
  setData: Action<ServiceInstancesSlice, { id: string; value: Data }>;
  instancesWithTargetStates: Computed<
    ServiceInstancesSlice,
    (
      qualifier: ServiceIdentifier
    ) => RemoteData.Type<
      string,
      {
        data: ServiceInstanceModelWithTargetStates[];
        links: { prev?: string; next?: string };
      }
    >,
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
    (byId, storeState) => (qualifier) => {
      const data = byId[qualifier.name];
      if (typeof data === "undefined") return RemoteData.loading();

      return RemoteData.mapSuccess(({ data, links }) => {
        return {
          data: data.map((instance) => {
            const instanceState = instance.state;
            const service =
              storeState.services.byNameAndEnv[
                injections.serviceKeyMaker.make(qualifier)
              ];
            if (!service || service.kind !== "Success") {
              return { ...instance, instanceSetStateTargets: [] };
            }
            const setStateTransfers = service.value.lifecycle.transfers.filter(
              (transfer) =>
                transfer.source === instanceState && transfer.api_set_state
            );
            const setStateTargets = setStateTransfers.map(
              (transfer) => transfer.target
            );
            return { ...instance, instanceSetStateTargets: setStateTargets };
          }),
          links,
        };
      }, data);
    }
  ),
};
