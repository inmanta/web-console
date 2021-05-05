import { Action, action } from "easy-peasy";
import { Diagnostics, RemoteData } from "@/Core";

/**
 * The DiagnosticsSlice stores the Diagnostic status for service instances, by service instance id.
 */
export interface DiagnosticsSlice {
  byServiceInstanceId: Record<string, RemoteData.Type<string, Diagnostics>>;
  setData: Action<
    DiagnosticsSlice,
    { id: string; value: RemoteData.Type<string, Diagnostics> }
  >;
}

export const diagnosticsSlice: DiagnosticsSlice = {
  byServiceInstanceId: {},
  setData: action((state, payload) => {
    state.byServiceInstanceId[payload.id] = payload.value;
  }),
};
