import { Action, action, Computed, computed } from "easy-peasy";
import { EnvironmentModel, ProjectModel, RemoteData } from "@/Core";

export interface ProjectsSlice {
  allIds: string[];
  byId: Record<string, ProjectModel>;
  allProjects: RemoteData.Type<string, ProjectModel[]>;
  getAllProjects: Computed<ProjectsSlice, ProjectModel[]>;
  getSelectedProject: Computed<
    ProjectsSlice,
    Partial<ProjectModel> | undefined
  >;
  getSelectedEnvironment: Computed<ProjectsSlice, EnvironmentModel | undefined>;
  selectedProjectId: string;
  selectedEnvironmentId: string;
  selectProjectById: Action<ProjectsSlice, string>;
  selectProjectAndEnvironment: Action<
    ProjectsSlice,
    { project: string; environment: string }
  >;
  setAllProjects: Action<
    ProjectsSlice,
    RemoteData.Type<string, ProjectModel[]>
  >;
}

export const projectsSlice: ProjectsSlice = {
  allIds: [],
  byId: {},
  allProjects: RemoteData.notAsked(),
  getAllProjects: computed((state) => {
    return Object.values(state.byId);
  }),
  getSelectedProject: computed((state) => {
    if (state.allProjects.kind === "Success") {
      const selectedProject = state.allProjects.value.find(
        (project) => project.id === state.selectedProjectId
      );
      return selectedProject;
    }
    return undefined;
  }),
  getSelectedEnvironment: computed((state) => {
    if (state.allProjects.kind === "Success") {
      const selectedProject = state.allProjects.value.find(
        (project) => project.id === state.selectedProjectId
      );
      const selectedEnv = selectedProject?.environments.find(
        (env) => env.id === state.selectedEnvironmentId
      );
      return selectedEnv;
    }
    return undefined;
  }),
  selectProjectById: action((state, payload) => {
    state.selectedProjectId = payload;
  }),
  selectedProjectId: "",
  selectedEnvironmentId: "",
  setAllProjects: action((state, payload) => {
    state.allProjects = payload;
  }),
  selectProjectAndEnvironment: action((state, { project, environment }) => {
    state.selectedProjectId = project;
    state.selectedEnvironmentId = environment;
  }),
};
