import { Action, action } from "easy-peasy";
import { Query, RemoteData } from "@/Core";

type Data = RemoteData.Type<Query.Error<"Events">, Query.ApiResponse<"Events">>;

/**
 * The eventsSlice stores events related to service instances.
 * For a single ServiceInstance we store its list of events.
 * So 'byId' means by ServiceInstance id.
 */
export interface EventsSlice {
  byId: Record<string, Data>;
  setData: Action<EventsSlice, { id: string; value: Data }>;
}

export const eventsSlice: EventsSlice = {
  byId: {},
  setData: action((state, payload) => {
    state.byId[payload.id] = payload.value;
  }),
};
