import { Action, action, computed, Computed } from "easy-peasy";
import {
  Query,
  Pagination,
  RemoteData,
  ServiceInstanceModelWithTargetStates,
} from "@/Core";
import { ServiceKeyMaker } from "@/Data/Managers/Service/KeyMaker";
import { StoreModel } from "./Store";

type Data = RemoteData.Type<
  Query.Error<"GetServiceInstances">,
  Query.ApiResponse<"GetServiceInstances">
>;

const serviceKeyMaker = new ServiceKeyMaker();

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
      query: Query.SubQuery<"GetServiceInstances">;
      value: Data;
      environment: string;
    }
  >;
  instancesWithTargetStates: Computed<
    ServiceInstancesSlice,
    (
      query: Query.SubQuery<"GetServiceInstances">,
      environment: string,
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
  setData: action((state, { query, environment, value }) => {
    state.byId[serviceKeyMaker.make([environment, query.name])] = value;
  }),
  instancesWithTargetStates: computed(
    [(state) => state.byId, (state, storeState) => storeState],
    (byId, storeState) => (query, environment) => {
      const data = byId[serviceKeyMaker.make([environment, query.name])];
      if (typeof data === "undefined") return RemoteData.loading();

      return RemoteData.mapSuccess(({ data, ...rest }) => {
        return {
          data: data.map((instance) => {
            const instanceState = instance.state;
            const service =
              storeState.services.byNameAndEnv[
                serviceKeyMaker.make([environment, query.name])
              ];
            if (!service || service.kind !== "Success") {
              return { ...instance, instanceSetStateTargets: [] };
            }
            const setStateTransfers = service.value.lifecycle.transfers.filter(
              (transfer) =>
                transfer.source === instanceState && transfer.api_set_state,
            );
            const setStateTargets = setStateTransfers.map(
              (transfer) => transfer.target,
            );
            return { ...instance, instanceSetStateTargets: setStateTargets };
          }),
          ...rest,
        };
      }, data);
    },
  ),
};
