import { Action, action, Computed, computed } from "easy-peasy";
import { ProjectModel } from "@/Core";

export interface ProjectState {
  allIds: string[];
  byId: Record<string, ProjectModel>;
  getAllProjects: Computed<ProjectState, ProjectModel[]>;
  getSelectedProject: Computed<ProjectState, Partial<ProjectModel>>;
  selectedProjectId: string;
  selectProjectById: Action<ProjectState, string>;
  selectProjectByName: Action<ProjectState, string>;
}

export const projectState: ProjectState = {
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
