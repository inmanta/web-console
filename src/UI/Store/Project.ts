import { Action, action, Computed, computed } from "easy-peasy";
import { ProjectModel } from "@/Core";

export interface ProjectSlice {
  allIds: string[];
  byId: Record<string, ProjectModel>;
  getAllProjects: Computed<ProjectSlice, ProjectModel[]>;
  getSelectedProject: Computed<ProjectSlice, Partial<ProjectModel>>;
  selectedProjectId: string;
  selectProjectById: Action<ProjectSlice, string>;
  selectProjectByName: Action<ProjectSlice, string>;
}

export const projectSlice: ProjectSlice = {
  allIds: [],
  byId: {},
  getAllProjects: computed((state) => {
    return Object.values(state.byId);
  }),
  getSelectedProject: computed((state) => {
    if (state.allIds.length > 0 && state.selectedProjectId) {
      return state.byId[state.selectedProjectId];
    }
    return {} as ProjectModel;
  }),
  selectProjectById: action((state, payload) => {
    state.selectedProjectId = payload;
  }),
  selectProjectByName: action((state, payload) => {
    const projectWithName = Object.values(state.byId).find(
      (item) => item.name === payload
    );
    if (projectWithName) {
      state.selectedProjectId = projectWithName.id;
    }
  }),
  selectedProjectId: "",
};
