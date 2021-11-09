import { Action, action } from "easy-peasy";
import { ProjectModel, RemoteData } from "@/Core";

export interface ProjectsSlice {
  projects: RemoteData.Type<string, ProjectModel[]>;
  setProjects: Action<ProjectsSlice, RemoteData.Type<string, ProjectModel[]>>;
}

export const projectsSlice: ProjectsSlice = {
  projects: RemoteData.notAsked(),
  setProjects: action((state, payload) => {
    state.projects = payload;
  }),
};
