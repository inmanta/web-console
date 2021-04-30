import { Action, action } from "easy-peasy";
import { Diagnostics, RemoteData } from "@/Core";

/**
 * The DiagnosticsSlice stores the Diagnostic status for service instances.
 * For a single ServiceInstance we store its Diagnostics.
 * So 'byId' means by ServiceInstance id.
 */
export interface DiagnosticsSlice {
  byId: Record<string, RemoteData.Type<string, Diagnostics>>;
  setData: Action<
    DiagnosticsSlice,
    { id: string; value: RemoteData.Type<string, Diagnostics> }
  >;
}

export const diagnosticsSlice: DiagnosticsSlice = {
  byId: {},
  setData: action((state, payload) => {
    state.byId[payload.id] = payload.value;
  }),
};
