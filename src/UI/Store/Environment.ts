import { Action, action, Computed, computed } from "easy-peasy";
import { ProjectModel, EnvironmentModel } from "@/Core";

export interface EnvironmentsSlice {
  allIds: string[];
  byId: Record<string, EnvironmentModel>;
  getSelectedEnvironment: Computed<
    EnvironmentsSlice,
    Partial<EnvironmentModel>
  >;
  selectedEnvironmentId: string;
  selectEnvironmentById: Action<EnvironmentsSlice, string>;
  selectEnvironmentByName: Action<EnvironmentsSlice, string>;
}

export const environmentsSlice: EnvironmentsSlice = {
  allIds: [],
  byId: {},
  getSelectedEnvironment: computed((state) => {
    if (state.allIds.length > 0 && state.selectedEnvironmentId) {
      return state.byId[state.selectedEnvironmentId];
    }
    return {} as ProjectModel;
  }),
  selectEnvironmentById: action((state, payload) => {
    state.selectedEnvironmentId = payload;
    const params = new URLSearchParams(location.search);
    params.set("env", payload);
    window.history.replaceState({}, "", `${location.pathname}?${params}`);
  }),
  selectEnvironmentByName: action((state, payload) => {
    const environmentWithName = Object.values(state.byId).find(
      (item) => item.name === payload
    );
    if (environmentWithName) {
      state.selectedEnvironmentId = environmentWithName.id;
    }
  }),
  selectedEnvironmentId: "",
};
