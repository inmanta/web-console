import { Action, action, Computed, computed } from "easy-peasy";
import { ProjectModel } from "@/Core";

export interface ProjectsSlice {
  allIds: string[];
  byId: Record<string, ProjectModel>;
  getAllProjects: Computed<ProjectsSlice, ProjectModel[]>;
  getSelectedProject: Computed<ProjectsSlice, Partial<ProjectModel>>;
  selectedProjectId: string;
  selectProjectById: Action<ProjectsSlice, string>;
  selectProjectByName: Action<ProjectsSlice, string>;
}

export const projectsSlice: ProjectsSlice = {
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
