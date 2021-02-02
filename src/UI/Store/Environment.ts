import { Action, action, Computed, computed } from "easy-peasy";
import { ProjectModel, EnvironmentModel } from "@/Core";

export interface EnvironmentState {
  allIds: string[];
  byId: Record<string, EnvironmentModel>;
  getSelectedEnvironment: Computed<EnvironmentState, Partial<EnvironmentModel>>;
  selectedEnvironmentId: string;
  selectEnvironmentById: Action<EnvironmentState, string>;
  selectEnvironmentByName: Action<EnvironmentState, string>;
}

export const environmentState: EnvironmentState = {
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
