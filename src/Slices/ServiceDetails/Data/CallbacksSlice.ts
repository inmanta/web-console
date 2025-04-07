import { Action, action } from "easy-peasy";
import { Query, RemoteData } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"GetCallbacks">,
  Query.Data<"GetCallbacks">
>;

/**
 * The eventsSlice stores events related to service instances.
 * For a single ServiceInstance we store its list of events.
 * So 'byId' means by ServiceInstance id.
 */
export interface CallbacksSlice {
  byEnv: Record<string, Record<string, Data>>;
  setData: Action<
    CallbacksSlice,
    { environment: string; service_entity: string; value: Data }
  >;
}

export const callbacksSlice: CallbacksSlice = {
  byEnv: {},
  setData: action((state, { environment, service_entity, value }) => {
    state.byEnv[environment] = { ...state.byEnv[environment] };
    state.byEnv[environment][service_entity] = value;
  }),
};
