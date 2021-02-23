import { Action, action } from "easy-peasy";
import { InstanceEvent, RemoteData } from "@/Core";

/**
 * The eventsSlice stores events related to service instances.
 * For a single ServiceInstance we store its list of events.
 * So 'byId' means by ServiceInstance id.
 */
export interface EventsSlice {
  byId: Record<string, RemoteData.Type<string, InstanceEvent[]>>;
  setData: Action<
    EventsSlice,
    { id: string; value: RemoteData.Type<string, InstanceEvent[]> }
  >;
}

export const eventsSlice: EventsSlice = {
  byId: {},
  setData: action((state, payload) => {
    state.byId[payload.id] = payload.value;
  }),
};
