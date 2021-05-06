import { Action, action, computed, Computed } from "easy-peasy";
import {
  Query,
  Pagination,
  RemoteData,
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
 * their service name. So byId means by Environment and ServiceName.
 */
export interface ServiceInstancesSlice {
  byId: Record<string, Data>;
  setData: Action<
    ServiceInstancesSlice,
    {
      qualifier: Query.Qualifier<"ServiceInstances">;
      value: Data;
      environment: string;
    }
  >;
  instancesWithTargetStates: Computed<
    ServiceInstancesSlice,
    (
      qualifier: Query.Qualifier<"ServiceInstances">,
      environment: string
    ) => RemoteData.Type<
      string,
      {
        data: ServiceInstanceModelWithTargetStates[];
        links: Pagination.Links;
        metadata: Pagination.Metadata;
      }
    >,
    StoreModel
  >;
}

export const serviceInstancesSlice: ServiceInstancesSlice = {
  byId: {},
  setData: action((state, { qualifier, environment, value }) => {
    state.byId[
      injections.serviceKeyMaker.make([environment, qualifier.name])
    ] = value;
  }),
  instancesWithTargetStates: computed(
    [(state) => state.byId, (state, storeState) => storeState],
    (byId, storeState) => (qualifier, environment) => {
      const data =
        byId[injections.serviceKeyMaker.make([environment, qualifier.name])];
      if (typeof data === "undefined") return RemoteData.loading();

      return RemoteData.mapSuccess(({ data, ...rest }) => {
        return {
          data: data.map((instance) => {
            const instanceState = instance.state;
            const service =
              storeState.services.byNameAndEnv[
                injections.serviceKeyMaker.make([environment, qualifier.name])
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
          ...rest,
        };
      }, data);
    }
  ),
};
