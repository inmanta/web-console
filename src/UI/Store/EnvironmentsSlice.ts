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
  }),
  selectedEnvironmentId: "",
};
